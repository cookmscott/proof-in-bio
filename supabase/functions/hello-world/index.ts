/// <reference lib="deno.unstable" />

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createC2pa } from "npm:@contentauth/c2pa-web/inline@0.5.5"; // pin a known release :contentReference[oaicite:1]{index=1}

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Best-effort: JSON-safe (handles BigInt)
function toJsonSafe<T>(value: T): unknown {
  return JSON.parse(
    JSON.stringify(value, (_k, v) => (typeof v === "bigint" ? v.toString() : v)),
  );
}

function parseDataUrl(dataUrl: string): { mime: string; bytes: Uint8Array } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error("Invalid dataUrl format");
  const mime = match[1];
  const b64 = match[2];
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { mime, bytes };
}

async function readBodyAsImage(req: Request): Promise<{
  mime: string;
  bytes: Uint8Array;
}> {
  const contentType = req.headers.get("content-type") ?? "";

  // 1) multipart/form-data (file upload)
  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      throw new Error("Expected multipart field `file`");
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    const mime = file.type || "application/octet-stream";
    return { mime, bytes };
  }

  // 2) JSON body: { imageUrl } | { dataUrl } | { base64, mime? }
  const body = await req.json().catch(() => ({} as any));

  // dataUrl (data:image/jpeg;base64,...)
  if (typeof body?.dataUrl === "string" && body.dataUrl.startsWith("data:")) {
    return parseDataUrl(body.dataUrl);
  }

  // base64 (+ optional mime)
  if (typeof body?.base64 === "string") {
    const mime = typeof body?.mime === "string" ? body.mime : "application/octet-stream";
    const bin = atob(body.base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return { mime, bytes };
  }

  // imageUrl
  if (typeof body?.imageUrl === "string") {
    const resp = await fetch(body.imageUrl);
    if (!resp.ok) {
      throw new Error(`Failed to fetch imageUrl: ${resp.status} ${resp.statusText}`);
    }
    const mime = resp.headers.get("content-type") ?? "application/octet-stream";
    const bytes = new Uint8Array(await resp.arrayBuffer());
    return { mime, bytes };
  }

  throw new Error(
    "Provide one of: multipart `file`, JSON {imageUrl}, {dataUrl}, or {base64, mime?}",
  );
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Use POST" }), {
      status: 405,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }

  try {
    const { mime, bytes } = await readBodyAsImage(req);

    // c2pa-web reads from Blob in web-like environments :contentReference[oaicite:2]{index=2}
    const blob = new Blob([bytes], { type: mime });

    // createC2pa() is the main entrypoint for c2pa-web :contentReference[oaicite:3]{index=3}
    // Options vary by version; this keeps it simple.
    const c2pa = await createC2pa({
      // common option in related typings: fetch remote manifests if present :contentReference[oaicite:4]{index=4}
      fetchRemoteManifests: true,
    } as any);

    const manifestStore = await c2pa.read(blob);

    // Recent c2pa-web versions may return null if no C2PA is found :contentReference[oaicite:5]{index=5}
    const hasC2pa = manifestStore != null;

    // Best-effort “summary” (structure differs by version, but many SDKs expose active manifest info)
    // The concept of "active manifest" is central to C2PA tooling :contentReference[oaicite:6]{index=6}
    const ms: any = manifestStore ?? null;
    const summary =
      !ms
        ? null
        : {
            active_manifest: ms.active_manifest ?? ms.activeManifest ?? null,
            manifests_count:
              ms.manifests ? Object.keys(ms.manifests).length : (ms.manifest_store ? Object.keys(ms.manifest_store).length : null),
          };

    return new Response(
      JSON.stringify({
        ok: true,
        hasC2pa,
        mime,
        summary,
        manifestStore: toJsonSafe(manifestStore),
      }),
      { headers: { ...corsHeaders, "content-type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      }),
      { status: 400, headers: { ...corsHeaders, "content-type": "application/json" } },
    );
  }
});
