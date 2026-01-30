// supabase/functions/photo-upload/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function decodeJwtPayload(token: string) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(payload);
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log("hit", req.method, req.headers.get("content-type"), req.headers.get("content-length"));

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      throw new Error('Missing Supabase configuration')
    }

    // Service role client for privileged operations (Storage/DB)
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      global: {
        fetch: (input, init) =>
          fetch(input, { ...init, signal: AbortSignal.timeout(20_000) }),
      },
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const authHeader = req.headers.get('Authorization') ?? ''
    console.log("authHeader starts:", authHeader.slice(0, 30));

    const m = authHeader.match(/^Bearer\s+(.+)$/i)
    
    if (!m) {
      return new Response(
        JSON.stringify({ error: 'Missing Bearer token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = m[1]
    console.log("token dot count:", token.split(".").length - 1);

    const payload = decodeJwtPayload(token);
    console.log("token payload keys:", payload ? Object.keys(payload) : "not a JWT");
    console.log("token sub:", payload?.sub);
    console.log("token iss:", payload?.iss);

    // Anon client for user validation
    const supabaseAuth = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false, autoRefreshToken: false },
    })

    console.log("before getUser", { tokenLen: token.length });
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()
    console.log("after getUser", {
        hasUser: !!user,
        authError: authError?.message,
    });

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log("before formData");
    const formData = await req.formData()
    console.log("after formData");
    const file = formData.get('file')
    const metadataEntry = formData.get('metadata')
    
    if (!file || !(file instanceof File)) {
      throw new Error('No file uploaded')
    }
    
    let metadata = {}
    if (typeof metadataEntry === 'string' && metadataEntry.length > 0) {
      try {
        metadata = JSON.parse(metadataEntry)
      } catch (parseError) {
        throw new Error('Invalid metadata JSON')
      }
    }

    // Upload to Storage
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`
    
    console.log("before upload", file.size, file.type);
    const { data: storageData, error: storageError } = await supabase.storage
      .from('photos')
      .upload(fileName, file, {
        contentType: file.type || 'application/octet-stream',
        upsert: false
      })

    console.log("after upload");
    if (storageError) throw storageError

    const { data: { publicUrl } } = supabase.storage
      .from('photos')
      .getPublicUrl(fileName)

    const width = Number(metadata.width) || 0
    const height = Number(metadata.height) || 0

    // Insert Photo
    console.log("before photos insert");
    const { data: photo, error: photoError } = await supabase
      .from('photos')
      .insert({
        user_id: user.id,
        storage_url: publicUrl,
        storage_key: storageData?.path ?? fileName,
        width,
        height,
        title: metadata.title || file.name,
        description: metadata.description,
        is_public: true,
        status: 'ready',
        // Optional fields that might be passed
        blurhash: metadata.blurhash,
        taken_at: metadata.captured_at, // Use captured_at for taken_at as well
      })
      .select()
      .single()

    console.log("after photos insert", photo?.id);
    if (photoError) {
        // Cleanup storage if db fails
        await supabase.storage.from('photos').remove([fileName])
        throw photoError
    }

    // Insert Metadata
    console.log("before metadata insert");
    const { error: metaError } = await supabase
      .from('photos_metadata')
      .insert({
        photo_id: photo.id,
        file_size: file.size,
        mime_type: file.type,
        c2pa_manifest: metadata.c2pa_manifest,
        c2pa_verified: metadata.c2pa_verified || false,
        c2pa_verified_at: metadata.c2pa_verified ? new Date().toISOString() : null,
        has_ai: metadata.has_ai || false,
        exif_data: metadata.exif_data,
        camera: metadata.camera,
        lens: metadata.lens,
        focal_length: metadata.focal_length,
        aperture: metadata.aperture,
        shutter_speed: metadata.shutter_speed,
        iso: metadata.iso,
        captured_at: metadata.captured_at,
        original_filename: file.name,
        file_ext: fileExt,
        
        // Extended metadata
        sha256: metadata.sha256,
        phash: metadata.phash,
        metadata_extracted_at: new Date().toISOString(), // We are extracting now-ish
        captured_at_source: metadata.captured_at_source,
        
        // Location
        gps_lat: metadata.gps_lat,
        gps_lng: metadata.gps_lng,
        gps_alt: metadata.gps_alt,
        gps_accuracy_meters: metadata.gps_accuracy_meters,
        location_name: metadata.location_name,
        location_visibility: metadata.location_visibility || 'hidden',
        location_obfuscated: metadata.location_obfuscated || false,

        // Image technical details
        color_space: metadata.color_space,
        bit_depth: metadata.bit_depth,
        has_alpha: metadata.has_alpha,
        is_hdr: metadata.is_hdr,
        focal_length_35mm: metadata.focal_length_35mm,
        exposure_compensation: metadata.exposure_compensation,
        exposure_mode: metadata.exposure_mode,
        metering_mode: metadata.metering_mode,
        white_balance: metadata.white_balance,
        flash: metadata.flash,
        focus_mode: metadata.focus_mode
      })

    console.log("after metadata insert");
    if (metaError) {
        console.error('Metadata insert failed', metaError)
        // Optionally delete photo or ignore? For now we just log and return error
        throw metaError
    }

    return new Response(
      JSON.stringify({ success: true, photo }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
