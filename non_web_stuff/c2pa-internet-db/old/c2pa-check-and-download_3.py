#!/usr/bin/env python3
"""
Check Wikimedia Commons images for C2PA metadata using HTTP range requests.

Workflow:
1. Query local DB for images matching camera manufacturer filters
2. Fetch just the first N bytes via HTTP Range request
3. Check for C2PA signature in the partial file
4. If C2PA found, download full image and update DB record

Requirements:
    pip install c2pa-python mysql-connector-python requests
"""

import os
import sys
import logging
import time
import json
from pathlib import Path
from urllib.parse import quote

import requests
import mysql.connector

# Optional: c2pa-python for full manifest reading
try:
    import c2pa
    HAS_C2PA = True
except ImportError:
    HAS_C2PA = False
    print("WARNING: c2pa-python not installed. Install with: pip install c2pa-python")
    print("Will fall back to raw JUMBF signature detection only.\n")

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

# Where to save full downloads
DOWNLOAD_DIR = Path(os.environ.get("DOWNLOAD_DIR", "./downloads"))
DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)

# How many bytes to fetch for the initial C2PA probe.
# C2PA/JUMBF boxes in JPEG sit right after the SOI marker in APP11 segments.
# For JPEG, 256 KB is usually plenty to find the C2PA marker.
# For PNG/WebP/TIFF you may need more or a different strategy.
PROBE_SIZE = 256 * 1024  # 256 KB

# Wikimedia Commons file URL template
# Files on Commons use a hash-based path: /wikipedia/commons/{hash0}/{hash01}/Filename
# But the easiest approach is the Special:FilePath redirect or the thumbor URL.
COMMONS_FILE_URL = "https://upload.wikimedia.org/wikipedia/commons"

# Rate limiting: be polite to Wikimedia servers
REQUEST_DELAY = 1.0  # seconds between requests

BATCH_SIZE = 1000

# Run mode control:
# - Full run: leave as None
# - Limited test run: set to a positive int, e.g. 10
# - Optional env var override: C2PA_PROCESS_LIMIT=10
PROCESS_LIMIT = 1000

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# DB helpers
# ---------------------------------------------------------------------------

# https://dumps.wikimedia.org/commonswiki/latest/
# gunzip -c commonswiki-latest-image.sql.gz | mysql commonswiki_p
# NOTE: FULLTEXT indexes do NOT work on BLOB/VARBINARY columns.

# ---------------------------------------------------------------------------
# Camera make/model pairs (C2PA-capable devices)
# ---------------------------------------------------------------------------

C2PA_CAMERAS = [
    # ("Canon",    "EOS R1"),
    # ("Canon",    "EOS R5 Mark II"),
    # ("Fujifilm", "GFX100 II"),
    # ("Fujifilm", "GFX100S II"),
    # ("Fujifilm", "X-T50"),
    ("Google",   "Pixel 10"),
    ("Leica",    "M11-D"),
    ("Leica",    "M11-P"),
    ("Leica",    "M EV1"),
    ("Leica",    "Q3 Monochrom"),
    ("Leica",    "SL3-S"),
    # ("Nikon",    "Z6III"),
    # ("Samsung",  "Galaxy S25"),
    # ("Sony",     "Alpha 1"),
    ("Sony",     "Alpha 1 II"),
    # ("Sony",     "Alpha 7 IV"),
    # ("Sony",     "Alpha 7R V"),
    # ("Sony",     "Alpha 7R VI"),
    # ("Sony",     "Alpha 7S III"),
    # ("Sony",     "Alpha 9 III")
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
    checked_at        TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    error_msg         TEXT            DEFAULT NULL,
    KEY uq_img_name     (img_name),
    KEY idx_checked_at   (checked_at),
    KEY idx_probe_status (has_c2pa_probe, has_c2pa_full, downloaded),
    KEY idx_http_status  (probe_http_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
"""

INSERT_RESULT = """
INSERT INTO c2pa_check_results
    (img_name, img_name_text, camera_make, camera_model, img_size, img_width,
     img_height, has_c2pa_probe, has_c2pa_full, c2pa_manifest, downloaded,
     download_path, probe_http_status, probe_final_url, probe_error, error_msg)
VALUES
    (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    AS new_val
ON DUPLICATE KEY UPDATE
    img_name_text     = CONVERT(new_val.img_name_text USING utf8mb4),
    camera_make       = CONVERT(new_val.camera_make   USING utf8mb4),
    camera_model      = CONVERT(new_val.camera_model  USING utf8mb4),
    img_size          = new_val.img_size,
    img_width         = new_val.img_width,
    img_height        = new_val.img_height,
    has_c2pa_probe    = new_val.has_c2pa_probe,
    has_c2pa_full     = new_val.has_c2pa_full,
    c2pa_manifest     = new_val.c2pa_manifest,
    downloaded        = new_val.downloaded,
    download_path     = new_val.download_path,
    probe_http_status = new_val.probe_http_status,
    probe_final_url   = new_val.probe_final_url,
    probe_error       = new_val.probe_error,
    error_msg         = new_val.error_msg,
    checked_at        = CURRENT_TIMESTAMP
"""

# --- Candidate query --------------------------------------------------------
# Built dynamically because the number of LIKE clauses varies with C2PA_CAMERAS,
# but all values go through parameterized %s — no Python string formatting of
# user/config data into SQL.

def _build_candidates_query(camera_count: int) -> str:
    """Generate the candidates SELECT with the right number of LIKE placeholders."""
    # Each camera model gets: UPPER(i.img_metadata_text) LIKE UPPER(CONCAT('%', %s, '%'))
    # MySQL handles the uppercasing and escaping; Python just supplies the model string.
    clauses = " OR ".join(
        ["UPPER(i.img_metadata_text) LIKE UPPER(CONCAT('%%', %s, '%%'))"] * camera_count
    )
    return f"""
        SELECT i.img_name, i.img_size, i.img_width, i.img_height, i.img_metadata_text
          FROM image i
         WHERE ({clauses})
           AND NOT EXISTS (
               SELECT 1 FROM c2pa_check_results c WHERE c.img_name = i.img_name
           )
         LIMIT %s
    """


# Pre-build for the configured camera list
_CANDIDATES_SQL = _build_candidates_query(len(C2PA_CAMERAS))
_CANDIDATES_PARAMS = [model for _, model in C2PA_CAMERAS]  # just the model strings


def fetch_candidates(conn, limit=BATCH_SIZE):
    with conn.cursor() as cur:
        cur.execute(_CANDIDATES_SQL, _CANDIDATES_PARAMS + [limit])
        return cur.fetchall()


# --- Prerequisite check: generated column + index on `image` ----------------

_SCHEMA_FIX_SQL = """
ALTER TABLE image
  ADD COLUMN img_metadata_text MEDIUMTEXT
    GENERATED ALWAYS AS (UPPER(CONVERT(img_metadata USING utf8mb4))) STORED;

ALTER TABLE image
  ADD FULLTEXT INDEX ft_metadata (img_metadata_text);
""".strip()


def _generated_expr_looks_valid(expr: str | None) -> bool:
    if not expr:
        return False
    normalized = "".join(expr.upper().split())
    return all(
        tok in normalized
        for tok in ("UPPER(", "CONVERT(", "IMG_METADATA", "USINGUTF8MB4")
    )


def ensure_metadata_text_index_ready(conn):
    """
    Verify image.img_metadata_text (STORED generated) and ft_metadata exist.
    If not, print fix SQL and abort.
    """
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT extra, generation_expression
              FROM information_schema.columns
             WHERE table_schema = DATABASE()
               AND table_name   = 'image'
               AND column_name  = 'img_metadata_text'
             LIMIT 1
            """,
        )
        col_row = cur.fetchone()

        cur.execute(
            """
            SELECT index_type
              FROM information_schema.statistics
             WHERE table_schema = DATABASE()
               AND table_name   = 'image'
               AND index_name   = 'ft_metadata'
             LIMIT 1
            """,
        )
        idx_row = cur.fetchone()

    has_column = (
        col_row is not None
        and "STORED GENERATED" in (col_row[0] or "").upper()
        and _generated_expr_looks_valid(col_row[1])
    )
    has_index = idx_row is not None and (idx_row[0] or "").upper() == "FULLTEXT"

    if has_column and has_index:
        return

    print("Required schema additions are missing. Run:\n")
    print(_SCHEMA_FIX_SQL)
    conn.close()
    raise SystemExit(1)


def ensure_results_table(conn):
    with conn.cursor() as cur:
        cur.execute(CREATE_RESULTS_TABLE)
    conn.commit()
    log.info("Ensured c2pa_check_results table exists.")


def fetch_candidates(conn, limit=BATCH_SIZE):
    with conn.cursor() as cur:
        cur.execute(QUERY_CANDIDATES, (limit,))
        rows = cur.fetchall()
    return rows


def save_result(
    conn,
    img_name,
    camera_make,
    camera_model,
    img_size,
    img_width,
    img_height,
    has_probe,
    has_full,
    manifest_json,
    downloaded,
    dl_path,
    error_msg,
    probe_info=None,
):
    probe_info = probe_info or {}
    img_name_text = img_name.decode("utf-8", errors="replace")[:255]
    with conn.cursor() as cur:
        cur.execute(INSERT_RESULT, (
            img_name,
            img_name_text,
            camera_make,
            camera_model,
            img_size,
            img_width,
            img_height,
            has_probe,
            has_full,
            manifest_json,
            downloaded,
            dl_path,
            probe_info.get("http_status"),
            probe_info.get("final_url"),
            probe_info.get("probe_error"),
            error_msg,
        ))
    conn.commit()


def infer_camera_make_model(img_metadata: str | bytes | None) -> tuple[str | None, str | None]:
    """
    Infer camera make/model from img_metadata using configured C2PA camera list.
    """
    if not img_metadata:
        return None, None

    if isinstance(img_metadata, bytes):
        metadata_text = img_metadata.decode("utf-8", errors="replace")
    else:
        metadata_text = img_metadata

    metadata_upper = metadata_text.upper()
    for make, model in C2PA_CAMERAS:
        if model.upper() in metadata_upper:
            return make, model
    return None, None


# ---------------------------------------------------------------------------
# Wikimedia URL building
# ---------------------------------------------------------------------------

def commons_url_for(img_name: bytes) -> str:
    """
    Build the direct upload.wikimedia.org URL for a Commons file.
    
    img_name in the DB is stored as bytes (the raw filename with underscores).
    The URL path uses MD5-based sharding: /a/ab/Filename.jpg
    """
    import hashlib
    name_str = img_name.decode("utf-8", errors="replace")
    md5 = hashlib.md5(name_str.encode("utf-8")).hexdigest()
    # URL-encode the filename (spaces -> %20, etc.)
    encoded = quote(name_str, safe="()!,'-._~")
    return f"{COMMONS_FILE_URL}/{md5[0]}/{md5[0:2]}/{encoded}"


# ---------------------------------------------------------------------------
# C2PA detection helpers
# ---------------------------------------------------------------------------

# C2PA content is stored inside JUMBF (ISO 19566-5) boxes.
# In JPEG files, JUMBF is carried in APP11 (0xFFEB) marker segments.
# The JUMBF box type for C2PA is 'c2pa' (0x63327061).
# We also look for the JUMBF brand 'c2pa' in the superbox.

C2PA_JUMBF_MAGIC = b"c2pa"              # appears in JUMBF type field
C2PA_MANIFEST_STORE = b"c2ma"           # C2PA manifest store box type
JPEG_APP11_MARKER = b"\xff\xeb"         # JUMBF carrier in JPEG


def probe_has_c2pa_signature(data: bytes) -> bool:
    """
    Quick check: does the byte buffer contain C2PA/JUMBF signatures?
    
    This is a heuristic — it looks for the 'c2pa' or 'c2ma' box type
    bytes anywhere in the probe data. False positives are possible but
    very unlikely in image file headers.
    """
    return C2PA_JUMBF_MAGIC in data or C2PA_MANIFEST_STORE in data


def check_c2pa_with_library(filepath: str) -> tuple[bool, str | None]:
    """
    Use the c2pa-python library to read the C2PA manifest store.
    
    Returns (has_manifest: bool, manifest_json: str | None)

    Note:
    A manifest can be present even if validation_state is "Invalid"
    (e.g., expired or untrusted signing credential). We still count that
    as C2PA present for has_c2pa_full.
    """
    if not HAS_C2PA:
        return False, None
    try:
        with c2pa.Reader(filepath) as reader:
            manifest_json = reader.json()

        if not manifest_json:
            return False, None

        try:
            parsed = json.loads(manifest_json)
            has_manifest = bool(parsed.get("active_manifest")) or bool(parsed.get("manifests"))
            return has_manifest, manifest_json
        except Exception:
            # If JSON parsing fails but reader returned non-empty content,
            # keep the raw payload and count it as C2PA-present.
            return True, manifest_json

        return False, None
    except Exception as e:
        log.debug(f"c2pa reader error for {filepath}: {e}")
        return False, None


# ---------------------------------------------------------------------------
# HTTP helpers
# ---------------------------------------------------------------------------

SESSION = requests.Session()
SESSION.headers.update({
    "User-Agent": "C2PA-Commons-Scanner/1.0 (research; integrateus@gmail.com)",
})


def fetch_range(url: str, start: int = 0, end: int | None = None) -> tuple[bytes | None, dict]:
    """Fetch probe bytes and return (data_or_none, probe_http_info)."""
    log.info(f"  URL: {url}")
    range_header = f"bytes={start}-{end if end is not None else ''}"
    probe_info = {
        "http_status": None,
        "final_url": url,
        "probe_error": None,
    }

    try:
        # Use stream=True so a 200 full-response path can read only the probe prefix.
        resp = SESSION.get(
            url,
            headers={"Range": range_header},
            timeout=30,
            allow_redirects=True,
            stream=True,
        )
        probe_info["http_status"] = resp.status_code
        probe_info["final_url"] = resp.url

        # 1) Partial content returned as expected
        if resp.status_code == 206:
            data = resp.content
            return data, probe_info

        # 2) Server ignored range and sent full content
        if resp.status_code == 200:
            log.info("  Server returned 200 (Full Content). Extracting probe prefix...")
            data = resp.raw.read(PROBE_SIZE)
            resp.close()
            return data, probe_info

        # 3) Requested range not satisfiable (file likely smaller than probe)
        if resp.status_code == 416:
            log.warning("  Range unsatisfiable (file likely smaller than probe). Fetching full...")
            full_resp = SESSION.get(url, timeout=30, allow_redirects=True)
            probe_info["http_status"] = full_resp.status_code
            probe_info["final_url"] = full_resp.url
            data = full_resp.content
            return data, probe_info

        log.warning(f"  Unexpected HTTP {resp.status_code} for {url}")
        return None, probe_info
    except requests.RequestException as e:
        log.error(f"  Request failed: {e}")
        probe_info["probe_error"] = str(e)
        return None, probe_info


def download_full(url: str, dest: Path) -> bool:
    """Download the full file to dest. Returns True on success."""
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


# ---------------------------------------------------------------------------
# Main processing
# ---------------------------------------------------------------------------

def process_image(
    conn,
    img_name: bytes,
    img_size: int,
    img_width: int,
    img_height: int,
    img_metadata: str | bytes | None,
):
    """
    Process a single image:
    1. Build URL
    2. Range-request the first PROBE_SIZE bytes
    3. Check for C2PA signature
    4. If found, download full file, verify with c2pa-python, update DB
    """
    name_str = img_name.decode("utf-8", errors="replace")
    camera_make, camera_model = infer_camera_make_model(img_metadata)
    url = commons_url_for(img_name)
    log.info(f"Probing: {name_str}")

    # --- Step 1: Range request for probe ---
    probe_data, probe_info = fetch_range(url, 0, PROBE_SIZE - 1)
    if probe_data is None:
        save_result(
            conn, img_name, camera_make, camera_model, img_size, img_width, img_height,
            None, None, None, 0, None, "Range request failed", probe_info=probe_info
        )
        return

    # --- Step 2: Quick signature check ---
    has_sig = probe_has_c2pa_signature(probe_data)
    log.info(f"  C2PA signature in probe: {has_sig}")

    if not has_sig:
        # No C2PA in the header — record and move on
        save_result(
            conn, img_name, camera_make, camera_model, img_size, img_width, img_height,
            0, None, None, 0, None, None, probe_info=probe_info
        )
        return

    # --- Step 3: Looks promising — download full file ---
    dest = DOWNLOAD_DIR / name_str
    log.info(f"  C2PA signature detected! Downloading full file...")
    
    if not download_full(url, dest):
        save_result(
            conn, img_name, camera_make, camera_model, img_size, img_width, img_height,
            1, None, None, 0, None, "Full download failed", probe_info=probe_info
        )
        return

    # --- Step 4: Validate with c2pa-python ---
    has_manifest, manifest_json = check_c2pa_with_library(str(dest))
    log.info(f"  c2pa-python validation: manifest={'YES' if has_manifest else 'NO'}")

    if has_manifest:
        save_result(
            conn, img_name, camera_make, camera_model, img_size, img_width, img_height,
            1, 1, manifest_json, 1, str(dest), None, probe_info=probe_info
        )
        log.info(f"  ✓ Confirmed C2PA manifest — kept {dest}")
    else:
        # Probe was a false positive or the manifest store could not be read.
        save_result(
            conn, img_name, camera_make, camera_model, img_size, img_width, img_height,
            1, 0, None, 0, None, "Probe positive but no manifest parsed",
            probe_info=probe_info
        )
        # Optionally delete the file to save space
        dest.unlink(missing_ok=True)
        log.info(f"  ✗ No manifest parsed — deleted download")


def main():
    env_limit = os.environ.get("C2PA_PROCESS_LIMIT", "").strip()
    max_to_process = PROCESS_LIMIT
    if env_limit:
        try:
            max_to_process = int(env_limit)
        except ValueError as e:
            raise ValueError("C2PA_PROCESS_LIMIT must be an integer") from e

    if max_to_process is not None and max_to_process <= 0:
        raise ValueError("PROCESS_LIMIT/C2PA_PROCESS_LIMIT must be a positive integer or None")

    conn = get_connection()
    ensure_metadata_text_index_ready(conn)
    ensure_results_table(conn)

    remaining = max_to_process
    total_processed = 0

    if max_to_process is None:
        log.info("Run mode: full (process all available candidates)")
    else:
        log.info(f"Run mode: limited (up to {max_to_process} images)")

    while True:
        if remaining is not None and remaining <= 0:
            log.info("Reached configured limit; stopping.")
            break

        batch_limit = BATCH_SIZE if remaining is None else min(BATCH_SIZE, remaining)
        candidates = fetch_candidates(conn, batch_limit)
        if not candidates:
            log.info("No more candidates to process.")
            break

        for img_name, img_size, img_width, img_height, img_metadata in candidates:
            try:
                process_image(conn, img_name, img_size, img_width, img_height, img_metadata)
            except Exception as e:
                log.exception(f"Unexpected error processing {img_name}: {e}")
                try:
                    save_result(
                        conn, img_name, None, None, img_size, img_width, img_height,
                        None, None, None, 0, None, str(e), probe_info=None
                    )
                except Exception:
                    pass

            total_processed += 1
            if remaining is not None:
                remaining -= 1
            time.sleep(REQUEST_DELAY)

        log.info(f"Processed {total_processed} images so far...")

    log.info(f"Done. Total processed: {total_processed}")
    conn.close()


if __name__ == "__main__":
    main()
