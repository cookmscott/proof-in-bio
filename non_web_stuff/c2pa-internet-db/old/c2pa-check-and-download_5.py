#!/usr/bin/env python3
"""
Check Wikimedia Commons images for C2PA metadata using HTTP range requests.

Single-table design:
  c2pa_check_results is both the queue and the results store.
    - Pending:  has_c2pa_probe IS NULL
    - Done:     has_c2pa_probe IN (0, 1)

Two phases:
  Phase 1 — seed:   Single scan of `image` matching all camera models → seed into c2pa_check_results
  Phase 2 — probe:  Claim pending rows → HTTP range probe → update in place

Usage:
    python check_c2pa.py seed        # Phase 1: populate pending rows
    python check_c2pa.py probe       # Phase 2: probe + download
    python check_c2pa.py 1000        # Seed up to 1000 matches, then probe
    python check_c2pa.py seed 1000   # Seed only, up to 1000 matches
    python check_c2pa.py             # Run both in sequence

Requirements:
    pip install c2pa-python mysql-connector-python requests
"""

import os
import sys
import hashlib
import logging
import time
import json
from pathlib import Path
from urllib.parse import quote

import requests
import mysql.connector

try:
    import c2pa
    HAS_C2PA = True
except ImportError:
    HAS_C2PA = False
    print("WARNING: c2pa-python not installed. Will fall back to raw JUMBF signature detection only.\n")

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

DB_CONFIG = {
    "host": os.environ.get("DB_HOST", "127.0.0.1"),
    "port": int(os.environ.get("DB_PORT", 3306)),
    "user": os.environ.get("DB_USER", "scottcook"),
    "password": os.environ.get("DB_PASS", "captainfalcon1!"),
    "database": os.environ.get("DB_NAME", "commonswiki_p"),
}

DOWNLOAD_DIR = Path(os.environ.get("DOWNLOAD_DIR", "./downloads"))
DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)

PROBE_SIZE = 256 * 1024  # 256 KB
COMMONS_FILE_URL = "https://upload.wikimedia.org/wikipedia/commons"
PROBE_DELAY = float(os.environ.get("PROBE_DELAY", 1.0))
DOWNLOAD_DELAY = float(os.environ.get("DOWNLOAD_DELAY", 3.0))
PROBE_BATCH_SIZE = 100
PROBE_LIMIT = int(os.environ.get("C2PA_PROBE_LIMIT", 0)) or None

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# C2PA-capable cameras
# ---------------------------------------------------------------------------

C2PA_CAMERAS = [
    ("Google",   "Pixel 10"),
    ("Leica",    "M11-D"),
    ("Leica",    "M11-P"),
    ("Leica",    "M EV1"),
    ("Leica",    "Q3 Monochrom"),
    ("Leica",    "SL3-S"),
    ("Sony",     "Alpha 1 II"),
]

# ---------------------------------------------------------------------------
# SQL
# ---------------------------------------------------------------------------

CREATE_RESULTS_TABLE = """
CREATE TABLE IF NOT EXISTS c2pa_check_results (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    img_name          VARBINARY(255)  NOT NULL,
    img_name_text     VARCHAR(255)    NOT NULL,
    camera_make       VARCHAR(128)    DEFAULT NULL,
    camera_model      VARCHAR(128)    DEFAULT NULL,
    img_size          BIGINT UNSIGNED DEFAULT NULL,
    img_width         INT             DEFAULT NULL,
    img_height        INT             DEFAULT NULL,
    has_c2pa_probe    TINYINT(1)      DEFAULT NULL,
    has_c2pa_full     TINYINT(1)      DEFAULT NULL,
    c2pa_manifest     MEDIUMTEXT      DEFAULT NULL,
    downloaded        TINYINT(1)      DEFAULT 0,
    download_path     VARCHAR(1024)   DEFAULT NULL,
    probe_http_status SMALLINT        DEFAULT NULL,
    probe_final_url   TEXT            DEFAULT NULL,
    probe_error       TEXT            DEFAULT NULL,
    error_msg         TEXT            DEFAULT NULL,
    created_at        TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    checked_at        TIMESTAMP       NULL DEFAULT NULL,
    UNIQUE KEY uq_img_name     (img_name),
    KEY idx_pending            (has_c2pa_probe),
    KEY idx_probe_status       (has_c2pa_probe, has_c2pa_full, downloaded)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
"""

def like_escape(value: str) -> str:
    """Escape wildcard characters for parameterized SQL LIKE patterns."""
    return value.replace("%", r"\%").replace("_", r"\_")


# Parameterized LIKE patterns for seed query: ['%PIXEL 10%', '%M11-D%', ...]
SEED_LIKE_PARAMS = [f"%{like_escape(model.upper())}%" for _, model in C2PA_CAMERAS]
SEED_METADATA_EXPR = "UPPER(CONVERT(img_metadata USING utf8mb4))"
SEED_LIKE_WHERE = " OR ".join([f"{SEED_METADATA_EXPR} LIKE %s"] * len(C2PA_CAMERAS))

SEED_CANDIDATES_SQL = f"""
SELECT img_name,
       img_size,
       img_width,
       img_height,
       CONVERT(img_metadata USING utf8mb4) AS img_metadata_text
  FROM image i
 WHERE 1=1
   AND img_timestamp >= '20220101000000'
   AND ({SEED_LIKE_WHERE})
   AND NOT EXISTS (
    SELECT 1
    FROM c2pa_check_results c
    WHERE c.img_name = i.img_name
)
 ORDER BY i.img_name
"""

SEED_INSERT = """
INSERT IGNORE INTO c2pa_check_results
    (img_name, img_name_text, camera_make, camera_model,
     img_size, img_width, img_height)
VALUES (%s, %s, %s, %s, %s, %s, %s)
"""

FETCH_PENDING = """
SELECT img_name, img_size, img_width, img_height, camera_make, camera_model
  FROM c2pa_check_results
 WHERE has_c2pa_probe IS NULL
 ORDER BY id
 LIMIT %s
"""

UPDATE_AFTER_PROBE = """
UPDATE c2pa_check_results
   SET has_c2pa_probe    = %s,
       has_c2pa_full     = %s,
       c2pa_manifest     = %s,
       downloaded        = %s,
       download_path     = %s,
       probe_http_status = %s,
       probe_final_url   = %s,
       probe_error       = %s,
       error_msg         = %s,
       checked_at        = NOW()
 WHERE img_name = %s
"""

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def get_connection():
    return mysql.connector.connect(**DB_CONFIG)


def ensure_tables(conn):
    with conn.cursor() as cur:
        cur.execute(CREATE_RESULTS_TABLE)
    conn.commit()


def commons_url_for(img_name: bytes) -> str:
    name_str = img_name.decode("utf-8", errors="replace")
    md5 = hashlib.md5(name_str.encode("utf-8")).hexdigest()
    encoded = quote(name_str, safe="()!,'-._~")
    return f"{COMMONS_FILE_URL}/{md5[0]}/{md5[0:2]}/{encoded}"


def match_camera(metadata_text: str) -> tuple[str, str] | None:
    """Match metadata text against known C2PA cameras. Returns (make, model) or None."""
    upper = metadata_text.upper()
    for make, model in C2PA_CAMERAS:
        if model.upper() in upper:
            return make, model
    return None


# ---------------------------------------------------------------------------
# Phase 1: Seed — single scan matching all camera models at once
# ---------------------------------------------------------------------------

def run_seed(conn, seed_limit: int | None = None):
    """Single scan of image table, matching all camera models, seeding results."""
    log.info(
        "Seed: querying image table for "
        f"{len(C2PA_CAMERAS)} camera models"
        f" (limit: {'full population' if seed_limit is None else seed_limit})"
    )
    sql = SEED_CANDIDATES_SQL
    params = list(SEED_LIKE_PARAMS)
    if seed_limit is not None:
        sql += "\n LIMIT %s"
        params.append(seed_limit)

    with conn.cursor() as cur:
        cur.execute(sql, params)
        rows = cur.fetchall()

    insert_data = []
    for img_name, img_size, img_width, img_height, metadata_text in rows:
        match = match_camera(metadata_text or "")
        if match is None:
            continue
        make, model = match
        img_name_text = img_name.decode("utf-8", errors="replace")[:255]
        insert_data.append((img_name, img_name_text, make, model,
                            img_size, img_width, img_height))

    total_seeded = 0
    if insert_data:
        with conn.cursor() as cur:
            cur.executemany(SEED_INSERT, insert_data)
            total_seeded = cur.rowcount
        conn.commit()

    log.info(
        "Seed complete. "
        f"Candidates fetched: {len(rows)}, matched: {len(insert_data)}, "
        f"total seeded: {total_seeded}"
    )


# ---------------------------------------------------------------------------
# Phase 2: Probe + download
# ---------------------------------------------------------------------------

C2PA_JUMBF_MAGIC = b"c2pa"
C2PA_MANIFEST_STORE = b"c2ma"

SESSION = requests.Session()
SESSION.headers.update({
    "User-Agent": "C2PA-Commons-Scanner/1.0 (research; integrateus@gmail.com)",
})


def probe_has_c2pa_signature(data: bytes) -> bool:
    return C2PA_JUMBF_MAGIC in data or C2PA_MANIFEST_STORE in data


def check_c2pa_with_library(filepath: str) -> tuple[bool, str | None]:
    if not HAS_C2PA:
        return False, None
    try:
        with c2pa.Reader(filepath) as reader:
            manifest_json = reader.json()
        if not manifest_json:
            return False, None
        parsed = json.loads(manifest_json)
        has_manifest = bool(parsed.get("active_manifest")) or bool(parsed.get("manifests"))
        return has_manifest, manifest_json
    except Exception as e:
        log.debug(f"c2pa reader error for {filepath}: {e}")
        return False, None


def sleep_on_429(resp, url: str) -> bool:
    if resp.status_code != 429:
        return False
    ra = resp.headers.get("Retry-After")
    wait = int(ra) if ra and ra.isdigit() else 60
    log.warning(f"HTTP 429. Sleeping {wait}s: {url}")
    time.sleep(wait)
    return True


def fetch_range(url: str) -> tuple[bytes | None, dict]:
    info = {"http_status": None, "final_url": url, "probe_error": None}
    try:
        resp = SESSION.get(url, headers={"Range": f"bytes=0-{PROBE_SIZE - 1}"},
                           timeout=30, allow_redirects=True, stream=True)
        if sleep_on_429(resp, url):
            resp = SESSION.get(url, headers={"Range": f"bytes=0-{PROBE_SIZE - 1}"},
                               timeout=30, allow_redirects=True, stream=True)
        info["http_status"] = resp.status_code
        info["final_url"] = resp.url

        if resp.status_code == 206:
            return resp.content, info
        if resp.status_code == 200:
            data = resp.raw.read(PROBE_SIZE)
            resp.close()
            return data, info
        if resp.status_code == 416:
            full = SESSION.get(url, timeout=30, allow_redirects=True)
            info["http_status"] = full.status_code
            info["final_url"] = full.url
            return full.content, info

        log.warning(f"  HTTP {resp.status_code} for {url}")
        return None, info
    except requests.RequestException as e:
        log.error(f"  Request failed: {e}")
        info["probe_error"] = str(e)
        return None, info


def download_full(url: str, dest: Path) -> bool:
    try:
        resp = SESSION.get(url, stream=True, timeout=120)
        resp.raise_for_status()
        with open(dest, "wb") as f:
            for chunk in resp.iter_content(chunk_size=64 * 1024):
                f.write(chunk)
        return True
    except requests.RequestException as e:
        log.error(f"Download failed for {url}: {e}")
        return False


def update_row(cur, img_name, has_probe, has_full, manifest_json,
               downloaded, dl_path, probe_info, error_msg):
    probe_info = probe_info or {}
    cur.execute(UPDATE_AFTER_PROBE, (
        has_probe, has_full, manifest_json, downloaded, dl_path,
        probe_info.get("http_status"), probe_info.get("final_url"),
        probe_info.get("probe_error"), error_msg, img_name,
    ))


def process_candidate(cur, img_name: bytes, img_size, img_width, img_height,
                      camera_make, camera_model):
    name_str = img_name.decode("utf-8", errors="replace")
    url = commons_url_for(img_name)
    log.info(f"Probing: {name_str}")

    # Range probe
    probe_data, probe_info = fetch_range(url)
    if probe_data is None:
        update_row(cur, img_name, 0, None, None, 0, None, probe_info, "Range request failed")
        return

    has_sig = probe_has_c2pa_signature(probe_data)
    log.info(f"  C2PA signature: {has_sig}")

    if not has_sig:
        update_row(cur, img_name, 0, None, None, 0, None, probe_info, None)
        return

    # Download full file
    dest = DOWNLOAD_DIR / name_str
    log.info(f"  C2PA detected — downloading...")

    time.sleep(DOWNLOAD_DELAY)
    if not download_full(url, dest):
        update_row(cur, img_name, 1, None, None, 0, None, probe_info, "Full download failed")
        return

    # Validate with c2pa-python
    has_manifest, manifest_json = check_c2pa_with_library(str(dest))
    log.info(f"  Manifest: {'YES' if has_manifest else 'NO'}")

    if has_manifest:
        update_row(cur, img_name, 1, 1, manifest_json, 1, str(dest), probe_info, None)
    else:
        update_row(cur, img_name, 1, 0, None, 0, None, probe_info, "Probe positive but no manifest")
        dest.unlink(missing_ok=True)


def run_probe(conn):
    total = 0
    log.info(f"Probe starting. limit={'unlimited' if PROBE_LIMIT is None else PROBE_LIMIT}")

    while True:
        if PROBE_LIMIT is not None and total >= PROBE_LIMIT:
            break

        batch_size = PROBE_BATCH_SIZE if PROBE_LIMIT is None else min(PROBE_BATCH_SIZE, PROBE_LIMIT - total)

        with conn.cursor() as cur:
            cur.execute(FETCH_PENDING, (batch_size,))
            candidates = cur.fetchall()

        if not candidates:
            log.info("No more pending rows.")
            break

        log.info(f"Fetched {len(candidates)} rows")

        for img_name, img_size, img_width, img_height, camera_make, camera_model in candidates:
            with conn.cursor() as cur:
                try:
                    process_candidate(cur, img_name, img_size, img_width, img_height,
                                      camera_make, camera_model)
                except Exception as e:
                    log.exception(f"Error processing {img_name}: {e}")
                    try:
                        update_row(cur, img_name, 0, None, None, 0, None, None, str(e))
                    except Exception:
                        pass

            conn.commit()
            total += 1
            time.sleep(PROBE_DELAY)

        log.info(f"Processed {total} so far...")

    log.info(f"Probe done. Total: {total}")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    args = sys.argv[1:]
    command = None
    seed_limit = None

    if args and args[0] in ("-h", "--help", "help"):
        print("Usage: python check_c2pa.py [seed|probe] [seed_limit]  (default: both)")
        print("Examples:")
        print("  python check_c2pa.py")
        print("  python check_c2pa.py 1000")
        print("  python check_c2pa.py seed")
        print("  python check_c2pa.py seed 1000")
        print("  python check_c2pa.py probe")
        return

    if args and args[0] in ("seed", "probe"):
        command = args[0]
        args = args[1:]

    if args:
        if len(args) > 1:
            print(f"Unexpected arguments: {' '.join(args)}")
            sys.exit(1)
        try:
            seed_limit = int(args[0])
        except ValueError:
            print(f"Invalid seed_limit: {args[0]}")
            sys.exit(1)
        if seed_limit <= 0:
            print("seed_limit must be > 0")
            sys.exit(1)

    if command == "probe" and seed_limit is not None:
        print("seed_limit is only valid when running seed or default (seed+probe).")
        sys.exit(1)

    conn = get_connection()
    ensure_tables(conn)

    try:
        if command is None or command == "seed":
            run_seed(conn, seed_limit=seed_limit)
        if command is None or command == "probe":
            run_probe(conn)
    finally:
        conn.close()


if __name__ == "__main__":
    main()
