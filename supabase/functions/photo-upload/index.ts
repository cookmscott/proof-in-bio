// supabase/functions/photo-upload/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Authorization header')

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (authError || !user) throw new Error('Unauthorized')

    const formData = await req.formData()
    const file = formData.get('file') as File
    const metadataStr = formData.get('metadata') as string
    
    if (!file) throw new Error('No file uploaded')
    
    const metadata = metadataStr ? JSON.parse(metadataStr) : {}

    // Upload to Storage
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`
    
    const { data: storageData, error: storageError } = await supabase.storage
      .from('photos')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      })

    if (storageError) throw storageError

    const { data: { publicUrl } } = supabase.storage
      .from('photos')
      .getPublicUrl(fileName)

    // Insert Photo
    const { data: photo, error: photoError } = await supabase
      .from('photos')
      .insert({
        user_id: user.id,
        storage_url: publicUrl,
        storage_key: fileName,
        width: metadata.width || 0,
        height: metadata.height || 0,
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

    if (photoError) {
        // Cleanup storage if db fails
        await supabase.storage.from('photos').remove([fileName])
        throw photoError
    }

    // Insert Metadata
    const { error: metaError } = await supabase
      .from('photos_metadata')
      .insert({
        photo_id: photo.id,
        file_size: file.size,
        mime_type: file.type,
        c2pa_manifest: metadata.c2pa_manifest,
        c2pa_verified: metadata.c2pa_verified || false,
        c2pa_verified_at: metadata.c2pa_verified ? new Date().toISOString() : null,
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
