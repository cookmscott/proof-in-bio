// supabase/functions/hello-world/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Safe base64 for large Uint8Arrays (chunked to avoid call-stack blowups)
function toBase64(u8: Uint8Array): string {
  const chunkSize = 0x8000; // 32KB
  let binary = "";
  for (let i = 0; i < u8.length; i += chunkSize) {
    const chunk = u8.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

Deno.serve(async (req) => {
  // 1) CORS preflight
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // 2) Parse multipart form data
    const formData = await req.formData();
    const imageFile = formData.get("image");

    if (!imageFile || !(imageFile instanceof File)) {
      return json({ error: "No image file uploaded (expected form field 'image')." }, 400);
    }

    const includeRaw = new URL(req.url).searchParams.get("raw") === "1";

    console.log(`Received file: ${imageFile.name} (${imageFile.size} bytes)`);

    // 3) Read into memory (Uint8Array)
    const arrayBuffer = await imageFile.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // (Optional) Write to /tmp (you can remove this if you don't need it)
    const tempFilePath = `/tmp/${imageFile.name}`;
    await Deno.writeFile(tempFilePath, bytes);
    console.log(`Written to ${tempFilePath}`);

    // 4) Import ONLY the modules that don't require PKI.js validation.
    //    (Avoid @trustnxt/c2pa-ts/manifest on Supabase Edge for now.)
    const [{ JPEG, PNG, BMFF }, { SuperBox }] = await Promise.all([
      import("npm:@trustnxt/c2pa-ts@0.10.0/asset"),
      import("npm:@trustnxt/c2pa-ts@0.10.0/jumbf"),
    ]);

    // 5) Detect asset format
    let asset: any;
    if (JPEG.canRead(bytes)) {
      asset = new JPEG(bytes);
    } else if (PNG.canRead(bytes)) {
      asset = new PNG(bytes);
    } else if (BMFF.canRead(bytes)) {
      asset = new BMFF(bytes);
    } else {
      await Deno.remove(tempFilePath).catch(() => {});
      return json(
        {
          filename: imageFile.name,
          has_c2pa: false,
          error: "Unsupported/unknown file format (expected JPEG/PNG/BMFF).",
        },
        415,
      );
    }

    // 6) Pull the embedded C2PA manifest store (JUMBF)
    const jumbf: Uint8Array | null = asset.getManifestJUMBF?.() ?? null;

    // Cleanup tmp file
    await Deno.remove(tempFilePath).catch(() => {});

    if (!jumbf) {
      return json({
        filename: imageFile.name,
        has_c2pa: false,
        asset_info: asset.dumpInfo?.() ?? null,
        message: "No C2PA manifest store (JUMBF) found in this asset.",
      });
    }

    // 7) Parse JUMBF container structure (no crypto validation)
    const superBox = SuperBox.fromBuffer(jumbf);

    return json({
      filename: imageFile.name,
      has_c2pa: true,
      asset_info: asset.dumpInfo?.() ?? null,
      jumbf_structure: superBox.toString?.() ?? null,
      // Raw JUMBF is optional because it can be large:
      manifest_jumbf_base64: includeRaw ? toBase64(jumbf) : null,
      notes: [
        "This endpoint extracts the C2PA manifest store (JUMBF) and its structure.",
        "Cryptographic validation is intentionally skipped on Supabase Edge to avoid PKI.js engine init issues.",
      ],
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return json(
      {
        error: (error as Error)?.message ?? String(error),
        hint:
          "If you are trying to validate signatures on Supabase Edge, PKI.js may fail during import; prefer extraction-only here, or validate in a Node/server environment.",
      },
      400,
    );
  }
});
