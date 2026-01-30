// THIS DOES NOT INCLUDE Cert chain validation - only extraction of actions and digitalSourceType from C2PA manifests
// basically we are only checking the JUMBF box and CBOR payloads for this edge function

// https://github.com/TrustNXT/c2pa-ts

// ✅ Reading manifests
// 🚧 Validating manifests (mostly implemented except chain of trust validation)

// supabase/functions/hello-world/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// ✅ Deno-native CBOR decode (no node shims)
import { decodeCbor } from "jsr:@std/cbor@0.1.9";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Safe base64 for large Uint8Arrays
function toBase64(u8: Uint8Array): string {
  const chunkSize = 0x8000;
  let binary = "";
  for (let i = 0; i < u8.length; i += chunkSize) {
    const chunk = u8.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

// C2PA Spec: mandatory UUID for a C2PA Manifest Store (Superbox)
const C2PA_MANIFEST_STORE_UUID = "63327061-0011-0010-8000-00aa00389b71";

// IPTC Digital Source Type labels
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

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function safeToPlainJSON(v: any): any {
  try {
    if (v && typeof v.toJSON === "function") return v.toJSON();
  } catch (_) {}
  try {
    if (v && typeof v.toObject === "function") return v.toObject();
  } catch (_) {}

  if (v && typeof v === "object") {
    const o: any = Array.isArray(v) ? [] : {};
    for (const key of Object.keys(v)) {
      try {
        o[key] = (v as any)[key];
      } catch (_) {}
    }
    return o;
  }
  return v;
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
  source_hint: string | null; // best-effort hint of where we found it
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

  const parameters = entry?.parameters ?? entry?.params ?? null;

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
    parameters,
    source_hint,
  };
}

/**
 * Heuristic: find Uint8Array payloads inside the SuperBox object graph,
 * try CBOR-decode them, and extract:
 *  - c2pa.actions (actions array)
 *  - any digitalSourceType URIs
 */
function extractFromJumbfObjectGraph(superBox: any) {
  const actions: FoundAction[] = [];
  const digitalSourceTypeUris: string[] = [];

  const visited = new WeakSet<object>();

  const tryDecodePayload = (payload: Uint8Array, hint: string | null) => {
    // Small guard: ignore tiny buffers that won’t be CBOR objects
    if (!(payload instanceof Uint8Array) || payload.length < 8) return;

    let decoded: any;
    try {
      decoded = decodeCbor(payload);
    } catch {
      return; // not CBOR
    }

    // Collect digitalSourceType URIs anywhere in decoded object
    const strings: string[] = [];
    collectAllStrings(decoded, strings, new WeakSet<object>());
    for (const s of strings) {
      if (s.startsWith("http://cv.iptc.org/newscodes/digitalsourcetype/")) {
        digitalSourceTypeUris.push(s);
      }
    }

    // Extract actions if present
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

      // If this object contains any Uint8Array-like properties, try decoding them
      // (common names we’ve seen in similar box libs)
      const candidateKeys = [
        "data",
        "content",
        "payload",
        "buffer",
        "bytes",
        "raw",
        "body",
        "value",
      ];

      for (const k of candidateKeys) {
        const v = (node as any)[k];
        if (v instanceof Uint8Array) {
          tryDecodePayload(v, `${path}.${k}`);
        }
      }

      // Also: scan all enumerable props for Uint8Array (generic)
      for (const key of Object.keys(node)) {
        const v = (node as any)[key];
        if (v instanceof Uint8Array) {
          tryDecodePayload(v, `${path}.${key}`);
        }
      }

      // Recurse into children
      if (Array.isArray(node)) {
        for (let i = 0; i < node.length; i++) {
          walk(node[i], `${path}[${i}]`);
        }
        return;
      }

      for (const key of Object.keys(node)) {
        const v = (node as any)[key];
        // Skip obvious big blobs (already handled) and primitives
        if (!v || typeof v !== "object") continue;
        walk(v, `${path}.${key}`);
      }
    }
  };

  walk(superBox, "superBox");

  return {
    actions,
    digitalSourceTypeUris: uniq(digitalSourceTypeUris),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Dynamic import to catch load errors and avoid top-level await/boot crashes
    let BMFF, JPEG, PNG, SuperBox;
    try {
      // Trying esm.sh with es2022 target
      const AssetModule = await import("https://esm.sh/@trustnxt/c2pa-ts@0.10.0/asset?target=es2022");
      const JumbfModule = await import("https://esm.sh/@trustnxt/c2pa-ts@0.10.0/jumbf?target=es2022");
      BMFF = AssetModule.BMFF;
      JPEG = AssetModule.JPEG;
      PNG = AssetModule.PNG;
      SuperBox = JumbfModule.SuperBox;
    } catch (importErr) {
      console.error("Critical dependency load failed:", importErr);
      return json({ 
        error: "Failed to load C2PA libraries", 
        details: (importErr as Error)?.message ?? String(importErr) 
      }, 500);
    }

    const formData = await req.formData();
    const imageFile = formData.get("image");

    if (!imageFile || !(imageFile instanceof File)) {
      return json({ error: "No image file uploaded (expected form field 'image')." }, 400);
    }

    const url = new URL(req.url);
    const includeRaw = url.searchParams.get("raw") === "1";

    const bytes = new Uint8Array(await imageFile.arrayBuffer());

    // Detect format and extract JUMBF bytes
    let asset: any;
    if (JPEG.canRead(bytes)) asset = new JPEG(bytes);
    else if (PNG.canRead(bytes)) asset = new PNG(bytes);
    else if (BMFF.canRead(bytes)) asset = new BMFF(bytes);
    else {
      return json(
        {
          filename: imageFile.name,
          has_c2pa: false,
          error: "Unsupported/unknown file format (expected JPEG/PNG/BMFF).",
        },
        415,
      );
    }

    const jumbfBytes: Uint8Array | null = asset.getManifestJUMBF?.() ?? null;
    if (!jumbfBytes) {
      return json({
        filename: imageFile.name,
        has_c2pa: false,
        message: "No embedded C2PA data found.",
      });
    }

    const superBox = SuperBox.fromBuffer(jumbfBytes);
    const foundUuid = String(superBox.uuid ?? "").toLowerCase();

    if (foundUuid !== C2PA_MANIFEST_STORE_UUID) {
      return json(
        {
          filename: imageFile.name,
          has_c2pa: false,
          error: "JUMBF box found, but UUID does not match C2PA Specification.",
          debug_uuid: foundUuid,
          expected_uuid: C2PA_MANIFEST_STORE_UUID,
        },
        422,
      );
    }

    // Heuristic extraction (no ManifestStore import -> avoids pkijs + avoids std/node shims)
    const extracted = extractFromJumbfObjectGraph(superBox);

    // Group actions by category
    const actionsByCategory = extracted.actions.reduce((acc, a) => {
      const cat = actionCategory(a.action);
      acc[cat] ??= [];
      acc[cat].push(a);
      return acc;
    }, {} as Record<string, FoundAction[]>);

    // digitalSourceType mapping output (URI -> label)
    const digitalSourceTypesMapped: Record<string, string> = {};
    for (const uri of extracted.digitalSourceTypeUris) {
      digitalSourceTypesMapped[uri] =
        SOURCE_TYPE_LABELS[uri] ?? "🧩 Unknown/Custom digitalSourceType";
    }

    // Lightweight “manifest summary” since we are not using ManifestStore.read()
    const manifestSummary = {
      note:
        "ManifestStore parsing/validation skipped for Supabase Edge compatibility. Actions/digitalSourceType extracted by scanning CBOR payloads in the JUMBF box graph.",
      actions_found: extracted.actions.length,
      digital_source_types_found: extracted.digitalSourceTypeUris.length,
    };

    return json({
      filename: imageFile.name,
      has_c2pa: true,
      spec_compliance: {
        jumbf_uuid_valid: true,
        jumbf_uuid: foundUuid,
      },

      manifest_summary: manifestSummary,

      // ✅ Requested outputs
      edit_actions: {
        by_category: actionsByCategory,
        flat: extracted.actions,
        fallback_note: extracted.actions.length
          ? null
          : "No actions extracted from CBOR payloads. The file may still contain actions, but the assertion payload may not have been found/decoded by the heuristic scanner.",
      },

      digital_source_types: {
        mapped: digitalSourceTypesMapped,
        uris: extracted.digitalSourceTypeUris,
      },

      // Debug
      jumbf_structure: superBox.toString?.() ?? null,
      manifest_jumbf_base64: includeRaw ? toBase64(jumbfBytes) : null,

      notes: [
        "Switched to esm.sh (target=es2022) with dynamic import to avoid Deno's npm: compatibility layer issues.",
        "Avoided ManifestStore import to prevent pkijs/crypto-engine initialization issues in Edge runtimes.",
        "Extracted actions and digitalSourceType by scanning CBOR payloads within the parsed JUMBF object graph.",
      ],
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return json(
      {
        error: (error as Error)?.message ?? String(error),
        hint:
          "Failed during JUMBF extraction or CBOR scanning. If you share a sample response with raw=1 (base64), we can target the exact payload path for your manifests.",
      },
      500,
    );
  }
});
