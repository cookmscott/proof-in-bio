// supabase/functions/hello-world/index.ts

/// <reference lib="deno.unstable" />

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { decodeCbor } from "jsr:@std/cbor@0.1.9";

// -----------------------------------------------------------------------------
// CONSTANTS
// -----------------------------------------------------------------------------

const C2PA_MANIFEST_STORE_UUID = "63327061-0011-0010-8000-00aa00389b71";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SOURCE_TYPE_LABELS: Record<string, string> = {
  "http://cv.iptc.org/newscodes/digitalsourcetype/digitalCapture":
    "📷 Digital capture sampled from real life",
  "http://cv.iptc.org/newscodes/digitalsourcetype/computationalCapture":
    "📱 Multi-frame computational capture",
  "http://cv.iptc.org/newscodes/digitalsourcetype/screenCapture":
    "🖥️ Screen capture",
  "http://cv.iptc.org/newscodes/digitalsourcetype/virtualRecording":
    "📹 Virtual event recording",
  "http://cv.iptc.org/newscodes/digitalsourcetype/humanEdits":
    "✏️ Human-edited media",
  "http://cv.iptc.org/newscodes/digitalsourcetype/digitalCreation":
    "🎨 Digital creation",
  "http://cv.iptc.org/newscodes/digitalsourcetype/algorithmicallyEnhanced":
    "✨ Algorithmically-altered media",
  "http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia":
    "🤖 Created using Generative AI",
  "http://cv.iptc.org/newscodes/digitalsourcetype/compositeWithTrainedAlgorithmicMedia":
    "🤖 Edited using Generative AI",
};

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function actionCategory(action: string | null): string {
  if (!action) return "unknown";
  if (action === "c2pa.created") return "created";
  if (action === "c2pa.opened") return "opened";
  if (action === "c2pa.published") return "published";
  if (action === "c2pa.redacted") return "redacted";
  return action.startsWith("c2pa.") ? "edited" : "custom";
}

function prettyAction(action: string | null): string {
  if (!action) return "Unknown action";
  if (action.startsWith("c2pa.")) {
    const rest = action.slice("c2pa.".length);
    const spaced = rest
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/[_\.]+/g, " ")
      .trim();
    return `🛠️ ${spaced[0]?.toUpperCase()}${spaced.slice(1)}`;
  }
  return `🛠️ ${action}`;
}

type FoundAction = {
  action: string | null;
  pretty: string;
  when: string | null;
  softwareAgent: string | null;
  digitalSourceType: string | null;
  parameters: any;
  source_hint: string | null;
};

function normalizeActionEntry(entry: any, source_hint: string | null): FoundAction {
  const action =
    entry?.action ??
    entry?.name ??
    entry?.label ??
    entry?.type ??
    entry?.actionName ??
    null;

  const when =
    entry?.when ??
    entry?.timestamp ??
    entry?.time ??
    entry?.dateTime ??
    entry?.parameters?.dateTime ??
    null;

  const softwareAgent =
    entry?.softwareAgent ??
    entry?.software_agent ??
    entry?.agent ??
    entry?.parameters?.softwareAgent ??
    null;

  const digitalSourceType =
    entry?.digitalSourceType ??
    entry?.digital_source_type ??
    entry?.parameters?.digitalSourceType ??
    entry?.parameters?.digital_source_type ??
    null;

  return {
    action,
    pretty: prettyAction(action),
    when,
    softwareAgent,
    digitalSourceType,
    parameters: entry?.parameters ?? entry?.params ?? null,
    source_hint,
  };
}

function collectAllStrings(
  value: unknown,
  out: string[],
  seen: WeakSet<object>,
  depth = 0,
  maxDepth = 14,
) {
  if (depth > maxDepth) return;
  if (typeof value === "string") {
    out.push(value);
    return;
  }
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (seen.has(obj)) return;
    seen.add(obj);

    if (Array.isArray(value)) {
      for (const v of value) collectAllStrings(v, out, seen, depth + 1, maxDepth);
      return;
    }
    for (const k of Object.keys(obj)) {
      collectAllStrings(obj[k], out, seen, depth + 1, maxDepth);
    }
  }
}

/**
 * Traverses the JUMBF SuperBox object graph (from c2pa-ts)
 * and attempts to CBOR-decode any Uint8Arrays found to locate actions.
 */
function extractFromJumbfObjectGraph(superBox: any) {
  const actions: FoundAction[] = [];
  const digitalSourceTypeUris: string[] = [];
  const visited = new WeakSet<object>();

  const tryDecodePayload = (payload: Uint8Array, hint: string | null) => {
    if (!(payload instanceof Uint8Array) || payload.length < 8) return;

    let decoded: any;
    try {
      decoded = decodeCbor(payload);
    } catch {
      return; // not CBOR
    }

    // Scan for Digital Source Type URIs
    const strings: string[] = [];
    collectAllStrings(decoded, strings, new WeakSet<object>());
    for (const s of strings) {
      if (s.startsWith("http://cv.iptc.org/newscodes/digitalsourcetype/")) {
        digitalSourceTypeUris.push(s);
      }
    }

    // Scan for Actions
    const maybeActions =
      decoded?.actions ??
      decoded?.data?.actions ??
      decoded?.value?.actions ??
      null;

    if (Array.isArray(maybeActions)) {
      for (const a of maybeActions) {
        actions.push(normalizeActionEntry(a, hint));
      }
    }
  };

  const walk = (node: any, path: string) => {
    if (!node) return;
    if (typeof node === "object") {
      if (visited.has(node)) return;
      visited.add(node);

      // Try known payload keys
      const candidateKeys = ["data", "content", "payload", "buffer", "bytes", "raw", "body", "value"];
      for (const k of candidateKeys) {
        const v = (node as any)[k];
        if (v instanceof Uint8Array) {
          tryDecodePayload(v, `${path}.${k}`);
        }
      }

      // Also scan generic keys if they are Uint8Array
      for (const key of Object.keys(node)) {
        const v = (node as any)[key];
        if (v instanceof Uint8Array) {
          tryDecodePayload(v, `${path}.${key}`);
        }
      }

      // Recurse
      if (Array.isArray(node)) {
        for (let i = 0; i < node.length; i++) {
          walk(node[i], `${path}[${i}]`);
        }
        return;
      }
      for (const key of Object.keys(node)) {
        const v = (node as any)[key];
        if (!v || typeof v !== "object") continue;
        walk(v, `${path}.${key}`);
      }
    }
  };

  walk(superBox, "superBox");
  return { actions, digitalSourceTypeUris: uniq(digitalSourceTypeUris) };
}

// -----------------------------------------------------------------------------
// INPUT HANDLING
// -----------------------------------------------------------------------------

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
  filename?: string;
}> {
  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("image");
    if (!(file instanceof File)) {
      throw new Error("Expected multipart field `image`");
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    const mime = file.type || "application/octet-stream";
    return { mime, bytes, filename: file.name };
  }

  const body = await req.json().catch(() => ({} as any));

  if (typeof body?.dataUrl === "string" && body.dataUrl.startsWith("data:")) {
    return parseDataUrl(body.dataUrl);
  }

  if (typeof body?.base64 === "string") {
    const mime = typeof body?.mime === "string" ? body.mime : "application/octet-stream";
    const bin = atob(body.base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return { mime, bytes, filename: body?.filename };
  }

  if (typeof body?.imageUrl === "string") {
    const resp = await fetch(body.imageUrl);
    if (!resp.ok) throw new Error(`Failed to fetch imageUrl: ${resp.status}`);
    const mime = resp.headers.get("content-type") ?? "application/octet-stream";
    const bytes = new Uint8Array(await resp.arrayBuffer());
    return { mime, bytes, filename: body?.filename };
  }

  throw new Error("Provide one of: multipart `file`, JSON {imageUrl}, {dataUrl}, or {base64, mime?}");
}

// -----------------------------------------------------------------------------
// MAIN SERVE FUNCTION
// -----------------------------------------------------------------------------

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Use POST" }), { status: 405, headers: corsHeaders });

  try {
    const { mime, bytes, filename } = await readBodyAsImage(req);

    // Dynamic import for parsers (Pure JS, no Worker dependency)
    // We use @trustnxt/c2pa-ts only for file structure parsing, not crypto validation.
    let BMFF, JPEG, PNG, SuperBox;
    try {
      const AssetModule = await import("https://esm.sh/@trustnxt/c2pa-ts@0.10.0/asset?target=es2022");
      const JumbfModule = await import("https://esm.sh/@trustnxt/c2pa-ts@0.10.0/jumbf?target=es2022");
      BMFF = AssetModule.BMFF;
      JPEG = AssetModule.JPEG;
      PNG = AssetModule.PNG;
      SuperBox = JumbfModule.SuperBox;
    } catch (importErr) {
      console.error("Critical dependency load failed:", importErr);
      return new Response(JSON.stringify({ error: "Failed to load parser libraries" }), { status: 500, headers: corsHeaders });
    }

    // 1. Detect format and find JUMBF bytes
    let asset: any;
    if (JPEG.canRead(bytes)) asset = new JPEG(bytes);
    else if (PNG.canRead(bytes)) asset = new PNG(bytes);
    else if (BMFF.canRead(bytes)) asset = new BMFF(bytes);
    else {
      return new Response(
        JSON.stringify({
          filename,
          has_c2pa: false,
          error: "Unsupported file format (expected JPEG/PNG/BMFF).",
        }),
        { status: 415, headers: { ...corsHeaders, "content-type": "application/json" } }
      );
    }

    const jumbfBytes: Uint8Array | null = asset.getManifestJUMBF?.() ?? null;
    if (!jumbfBytes) {
      return new Response(
        JSON.stringify({
          filename,
          has_c2pa: false,
          message: "No embedded C2PA data found.",
        }),
        { headers: { ...corsHeaders, "content-type": "application/json" } }
      );
    }

    // 2. Parse JUMBF Structure (Pure JS on Main Thread)
    const superBox = SuperBox.fromBuffer(jumbfBytes);
    const foundUuid = String(superBox.uuid ?? "").toLowerCase();

    // 3. Extract Actions/Metadata (Heuristic CBOR Scan)
    const extracted = extractFromJumbfObjectGraph(superBox);

    // Group actions
    const actionsByCategory = extracted.actions.reduce((acc, a) => {
      const cat = actionCategory(a.action);
      acc[cat] ??= [];
      acc[cat].push(a);
      return acc;
    }, {} as Record<string, FoundAction[]>);

    // Map source types
    const digitalSourceTypesMapped: Record<string, string> = {};
    for (const uri of extracted.digitalSourceTypeUris) {
      digitalSourceTypesMapped[uri] = SOURCE_TYPE_LABELS[uri] ?? "🧩 Unknown/Custom digitalSourceType";
    }

    // 4. Return Response
    return new Response(
      JSON.stringify({
        filename,
        has_c2pa: true,
        spec_compliance: {
          jumbf_uuid_valid: foundUuid === C2PA_MANIFEST_STORE_UUID,
          jumbf_uuid: foundUuid,
        },
        manifest_summary: {
            note: "Parsed using Pure-JS structure parser (Supabase Edge compatible)",
            actions_found: extracted.actions.length,
            digital_source_types_found: extracted.digitalSourceTypeUris.length,
        },
        edit_actions: {
          by_category: actionsByCategory,
          flat: extracted.actions,
        },
        digital_source_types: {
          mapped: digitalSourceTypesMapped,
          uris: extracted.digitalSourceTypeUris,
        },
        debug: {
            // Include structure dump if needed for debugging
            // jumbf_structure: superBox.toString?.() 
        }
      }),
      { headers: { ...corsHeaders, "content-type": "application/json" } }
    );

  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      }),
      { status: 500, headers: { ...corsHeaders, "content-type": "application/json" } }
    );
  }
});