<script>
  import { Button } from '$lib/ui/button';
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/ui/card';
  import {
    Upload,
    Loader2,
    CheckCircle,
    XCircle,
    FileImage,
    AlertCircle,
    Image as ImageIcon,
    ChevronDown,
    X,
    Sparkles
  } from 'lucide-svelte';
  import ContentCredentialStatus from './ContentCredentialStatus.svelte';

  import {
    getActionCategory,
    formatActionParameter,
    normalizeManifestStore,
    analyzeProvenance,
    loadC2pa,
    extractImageMetadata,
    isAiAction
  } from '$lib/c2pa';

  // Props
  let { open = $bindable(false), supabase, onUploadComplete, allowAllPhotos = false } = $props();

  let dragOver = $state(false);
  let uploads = $state([]);
  let fileInput = $state(null);
  let error = $state(null);
  let selectedUpload = $state(null);
  let isUploading = $state(false);

  // --- Tri-state capture + signature helpers ---
  const hasC2pa = (u) => !!u?.c2pa;
  const hasManifest = (u) => !!u?.c2pa?.hasManifest;
  const isCryptoValid = (u) => hasManifest(u) && u.c2pa?.activeSignatureValidated === true;

  const isCaptureDetected = (u) => u.c2pa?.hasCaptureProvenance === true;
  const captureValidation = (u) => u.c2pa?.captureSignatureValidated; // true | false | null/undefined

  // "Verified Capture" = capture provenance exists AND we can validate the capture manifest signature
  // AND the active manifest signature is valid (asset is intact relative to active manifest).
  const isVerifiedCapture = (u) =>
    isCryptoValid(u) && isCaptureDetected(u) && captureValidation(u) === true;

  // Capture provenance exists, active manifest validates, but we cannot confirm capture manifest validation
  // (common when tooling only reports one validation result shape).
  const isCaptureUnknown = (u) =>
    isCryptoValid(u) && isCaptureDetected(u) && (captureValidation(u) == null);

  // Signed by software only = active manifest signature valid, but no capture provenance detected
  const isSoftwareSignedOnly = (u) => isCryptoValid(u) && !isCaptureDetected(u);

  // Not verified = no manifest or active signature failed/unknown
  const isUnverified = (u) => !hasManifest(u) || u.c2pa?.activeSignatureValidated !== true;

  // Optional: distinguish “verified capture but edited later”
  const isEditedFromVerifiedCapture = (u) => isVerifiedCapture(u) && u.c2pa?.activeIsCapture === false;

  let verifiedCount = $derived(uploads.filter(isVerifiedCapture).length);
  let captureUnknownCount = $derived(uploads.filter(isCaptureUnknown).length);
  let softwareSignedCount = $derived(uploads.filter(isSoftwareSignedOnly).length);
  let unverifiedCount = $derived(uploads.filter(isUnverified).length);
  let uploadableCount = $derived(
    allowAllPhotos
      ? uploads.filter((u) => !u.processing && !u.error).length
      : verifiedCount + captureUnknownCount
  );

  $effect(() => {
    supabase.auth.getSession().then(({ data }) => {
        console.log("Current Session:", data.session); 
        // If this is null, your UI needs to force a login first.
    });
  });

  $effect(() => {
    if (!open) {
      dragOver = false;
    }
  });

  function getImageDimensions(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = reject;
        img.src = url;
    });
  }

  async function handleUpload() {
    // Allow upload if we have any Verified OR Capture Unknown images
    const canUploadCount = uploadableCount;
    if (isUploading || canUploadCount === 0) return;
    
    // Check if we have a valid session before starting
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      error = "You must be logged in to upload photos.";
      return;
    }

    isUploading = true;
    error = null;
    
    // Filter for EITHER verified OR capture unknown, unless testing flag is enabled
    const uploadsToProcess = allowAllPhotos
      ? uploads.filter((u) => !u.processing && !u.error)
      : uploads.filter((u) => isVerifiedCapture(u) || isCaptureUnknown(u));
    if (uploadsToProcess.length === 0) {
      isUploading = false;
      error = 'No eligible images are ready to upload yet.';
      return;
    }

    let successCount = 0;
    const successfulUploadIds = new Set();

    for (const upload of uploadsToProcess) {
        try {
            upload.processing = true; // Show spinner per item
            
            // Get basic dimensions
            const { width, height } = await getImageDimensions(upload.previewUrl);
            
            // Extract detailed metadata
            const c2paMeta = extractImageMetadata(upload.c2pa?.data);
            
            const metadata = {
                width,
                height,
                title: upload.file.name,
                description: 'Uploaded via Web Interface',
                
                // C2PA specific
                c2pa_manifest: upload.c2pa?.data,
                // Consider it "verified" if it is fully verified capture, 
                // but we might want to store 'captureUnknown' state too?
                // For now, let's keep boolean c2pa_verified as strict (isVerifiedCapture),
                // but we are allowing the upload.
                c2pa_verified: isVerifiedCapture(upload),
                
                // Extracted technical metadata
                ...c2paMeta
            };

            const formData = new FormData();
            formData.append('file', upload.file);
            formData.append('metadata', JSON.stringify(metadata));

            const { data, error: uploadError } = await supabase.functions.invoke('photo-upload', {
                body: formData
            });

            if (uploadError) throw uploadError;
            
            successCount++;
            successfulUploadIds.add(upload.id);

        } catch (err) {
            console.error('Upload failed for', upload.file.name, err);
            upload.error = 'Upload failed';
        } finally {
            upload.processing = false;
        }
    }

    isUploading = false;
    if (successCount === uploadsToProcess.length) {
        resetUploadState();
        closeDialog();
        if (onUploadComplete) await onUploadComplete();
    } else {
        // Remove successfully uploaded items so retry only shows remaining failures/non-uploaded items.
        const remaining = uploads.filter((u) => !successfulUploadIds.has(u.id));
        for (const upload of uploads) {
          if (successfulUploadIds.has(upload.id) && upload?.previewUrl) {
            URL.revokeObjectURL(upload.previewUrl);
          }
        }
        uploads = remaining;
        if (selectedUpload && successfulUploadIds.has(selectedUpload.id)) {
          selectedUpload = uploads[0] ?? null;
        }
        error = `Successfully uploaded ${successCount} of ${uploadsToProcess.length} images. Check errors.`;
    }
  }

  export async function processFiles(fileList) {
    // Open the dialog when external files are processed
    open = true;
    
    if (!fileList || fileList.length === 0) return;
    error = null;

    if (fileList.length > 10) {
      error = 'Please select 10 or fewer images at a time.';
      return;
    }

    const existingFileIds = new Set(uploads.map((u) => `${u.file.name}|${u.file.size}|${u.file.lastModified}`));

    const filesToProcess = Array.from(fileList).filter((f) => {
      if (!f.type.startsWith('image/')) return false;
      const fileId = `${f.name}|${f.size}|${f.lastModified}`;
      if (existingFileIds.has(fileId)) return false;
      existingFileIds.add(fileId);
      return true;
    });

    if (fileList.length > 0 && filesToProcess.length === 0) {
      error = 'All selected images are already in the list or are not valid image types.';
      return;
    }

    if (filesToProcess.length === 0) return;

    const newUploads = filesToProcess.map((f) => ({
      id: Math.random().toString(36).substring(7),
      file: f,
      previewUrl: URL.createObjectURL(f),
      processing: true,
      c2pa: null,
      error: null
    }));

    uploads = [...uploads, ...newUploads];

    for (const upload of newUploads) {
      await processSingleUpload(upload);
    }
  }

  async function processSingleUpload(uploadItem) {
    try {
      const c2pa = await loadC2pa();
      const result = await c2pa.reader.fromBlob(uploadItem.file.type, uploadItem.file);

      let manifestData = null;
      let analysis = {
        hasManifest: false
      };

      if (result) {
        // Raw manifest store (as returned by the library)
        const manifestStore = await result.manifestStore();

        // Normalized store for consistent keys + easier analysis
        const normalized = normalizeManifestStore(manifestStore);

        // Full provenance analysis (your logic lives here)
        analysis = analyzeProvenance(normalized) || { hasManifest: false };

        if (analysis.hasManifest) {
          manifestData = manifestStore;

          // --- LOGGING ---
          console.group(`C2PA Analysis: ${uploadItem.file.name}`);
          console.log('Analysis Result:', analysis);
          console.log('Manifest Store (Raw):', manifestStore);
          console.log('Active Manifest ID:', normalized.active_manifest);
          console.log('Active Manifest Data:', normalized.manifests?.[normalized.active_manifest]);
          console.groupEnd();
          // --- END LOGGING ---
        }
      }

      const index = uploads.findIndex((u) => u.id === uploadItem.id);
      if (index !== -1) {
        uploads[index].c2pa = {
          ...analysis,
          data: manifestData
        };
        uploads[index].processing = false;
      }
    } catch (err) {
      console.error('Error processing image:', err);
      const index = uploads.findIndex((u) => u.id === uploadItem.id);
      if (index !== -1) {
        uploads[index].error = 'Failed to process';
        uploads[index].processing = false;
      }
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    dragOver = false;
    if (e.dataTransfer.files?.length) {
      processFiles(e.dataTransfer.files);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    dragOver = true;
  }

  function handleDragLeave() {
    dragOver = false;
  }

  function handleFileSelect(e) {
    if (e.target.files?.length) {
      processFiles(e.target.files);
    }
  }

  function triggerFileInput() {
    fileInput?.click();
  }

  function resetUploadState() {
    dragOver = false;
    for (const upload of uploads) {
      if (upload?.previewUrl) URL.revokeObjectURL(upload.previewUrl);
    }
    uploads = [];
    selectedUpload = null;
    error = null;
    if (fileInput) fileInput.value = '';
  }

  function clearPhotos() {
    resetUploadState();
  }

  function closeDialog() {
    dragOver = false;
    open = false;
  }

  const CATEGORY_EXPLANATIONS = {
    'AI Edits': 'AI-assisted generation or editing actions were recorded in the file history.',
    'Creation & Ingestion': 'How the file was first created or brought into an editing app.',
    'Editorial Content Changes': 'Changes to the visible content of the image.',
    'Color & Tone Adjustments': 'Exposure, color, contrast, and similar tonal changes.',
    'Enhancement (Non-Editorial)': 'Non-content-changing enhancements or automated improvements.',
    'Metadata-Only Changes': 'Information changes (labels/tags/metadata) without changing pixels.',
    'Resizing & Scaling': 'Crop, resize, rotate, or orientation changes.',
    'File / Format Transformations': 'Export, convert, or format changes.',
    'Publishing & Distribution': 'Publishing or distribution steps recorded by tools/platforms.',
    'Removal & Redaction': 'Content removal or redaction actions.',
    'Watermarking': 'Watermark-related changes.',
    'Other Actions': 'Recorded edits that do not match a standard category yet.'
  };

  function formatActionLine(action) {
    const detail = formatActionParameter(action);
    if (detail) return detail;

    const raw = String(action?.action || '').replace(/^c2pa\./, '');
    if (!raw) return 'Recorded change';
    return raw
      .split(/[._]/g)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  function getDigitalSourceTypeLabel(action) {
    const raw =
      action?.digitalSourceType ||
      action?.parameters?.digitalSourceType ||
      action?.parameters?.['http://cv.iptc.org/newscodes/digitalsourcetype/'];

    if (!raw) return null;
    const value = String(raw).split('/').pop() || String(raw);

    const labels = {
      compositeWithTrainedAlgorithmicMedia: 'AI-assisted composite/edit',
      trainedAlgorithmicData: 'AI-generated content',
      humanEdits: 'Human edit',
      digitalCapture: 'Camera capture',
      computationalCapture: 'Computational camera capture'
    };

    return labels[value] || value;
  }
</script>

{#if open}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <Card class="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative shadow-xl">
      <div class="absolute top-4 right-4 z-10 flex items-center gap-2">
        {#if uploads.length > 0}
          <Button
            variant="ghost"
            size="sm"
            class="h-8 px-3 text-xs"
            onclick={clearPhotos}
            disabled={isUploading}
          >
            Start over
          </Button>
        {/if}
        <Button variant="ghost" size="icon" class="h-8 w-8 rounded-full" onclick={closeDialog}>
          <X class="h-4 w-4" />
          <span class="sr-only">Close</span>
        </Button>
      </div>
      
      <div class="overflow-y-auto flex-1 p-1">
        <CardHeader>
          <CardTitle>Add Photos</CardTitle>
          <CardDescription class="mb-3">Upload images to verify their C2PA metadata locally in your browser.</CardDescription>
          {#if allowAllPhotos}
            <p class="text-sm font-semibold text-red-500">
              C2PA checks are disabled for testing.
            </p>
          {/if}
        </CardHeader>

        <CardContent class="space-y-6">
          <div
            role="button"
            tabindex="0"
            class="relative flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed transition-colors cursor-pointer outline-none
            {dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'}"
            ondragover={handleDragOver}
            ondragleave={handleDragLeave}
            ondrop={handleDrop}
            onclick={triggerFileInput}
            onkeydown={(e) => e.key === 'Enter' && triggerFileInput()}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              class="hidden"
              onchange={handleFileSelect}
              bind:this={fileInput}
            />

            <div class="flex flex-col items-center gap-4 text-center p-4">
              <div class="p-3 rounded-full bg-muted">
                <Upload class="h-6 w-6 text-muted-foreground" />
              </div>
              <div class="space-y-1">
                <p class="text-sm font-medium">Drag & drop or click to upload multiple images</p>
                <p class="text-xs text-muted-foreground">Supports JPEG, PNG, WebP</p>
              </div>
            </div>
          </div>

          {#if error}
            <div class="rounded-md bg-destructive/10 p-4 text-sm text-destructive flex items-center gap-2 animate-in fade-in">
              <AlertCircle class="h-4 w-4" />
              {error}
            </div>
          {/if}

          {#if uploads.length > 0}
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4">
              {#each uploads as upload (upload.id)}
                <div
                  class="relative aspect-square rounded-lg overflow-hidden border bg-muted/30 group cursor-pointer transition-all
                  {selectedUpload?.id === upload.id ? 'ring-2 ring-primary ring-offset-2' : 'hover:border-primary/50'}"
                  onclick={() => (selectedUpload = upload)}
                  onkeydown={(e) => e.key === 'Enter' && (selectedUpload = upload)}
                  role="button"
                  tabindex="0"
                >
                  <img src={upload.previewUrl} alt={upload.file.name} class="w-full h-full object-cover" />

                  {#if upload.processing}
                    <div class="absolute rounded-lg inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                      <Loader2 class="h-8 w-8 animate-spin text-primary" />
                    </div>

                  {:else if upload.error}
                    <div class="absolute top-2 right-2">
                      <div class="bg-destructive text-destructive-foreground p-1.5 rounded-full shadow-sm" title={upload.error}>
                        <AlertCircle class="h-5 w-5" />
                      </div>
                    </div>

                  {:else if hasC2pa(upload)}
                    <div class="absolute top-2 right-2">
                      {#if isVerifiedCapture(upload)}
                        <div
                          class="bg-green-500 text-white p-1.5 rounded-full shadow-sm"
                          title={isEditedFromVerifiedCapture(upload)
                            ? 'Verified (edited, but traceable to capture-signed origin)'
                            : 'Verified Capture (device/camera signed)'}
                        >
                          <CheckCircle class="h-5 w-5" />
                        </div>

                      {:else if isCaptureUnknown(upload)}
                        <div
                          class="bg-emerald-500 text-white p-1.5 rounded-full shadow-sm"
                          title="Capture provenance found and active manifest validates, but capture-manifest validation is unknown in this viewer"
                        >
                          <CheckCircle class="h-5 w-5" />
                        </div>

                      {:else if isSoftwareSignedOnly(upload)}
                        <div class="bg-blue-500 text-white p-1.5 rounded-full shadow-sm" title="Signed by software (no capture-signed provenance found)">
                          <FileImage class="h-5 w-5" />
                        </div>

                      {:else}
                        <div class="bg-amber-500 text-white p-1.5 rounded-full shadow-sm" title="No verified C2PA signature">
                          <XCircle class="h-5 w-5" />
                        </div>
                      {/if}
                    </div>
                  {/if}

                  <div
                    class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-8
                    opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <p class="text-white text-xs truncate font-medium">{upload.file.name}</p>
                    <p class="text-white/70 text-[10px]">{(upload.file.size / 1024).toFixed(0)} KB</p>
                  </div>
                </div>
              {/each}
            </div>

            {#if selectedUpload && selectedUpload.c2pa?.hasManifest}
              {@const groupedActions = (() => {
                const groups = {};
                for (const action of selectedUpload.c2pa.actions || []) {
                  const category = getActionCategory(action.action);

                  const key = category.label;
                  if (!groups[key]) groups[key] = { category, actions: [], aiCount: 0 };
                  groups[key].actions.push(action);
                  if (isAiAction(action)) groups[key].aiCount += 1;
                }
                return Object.values(groups).sort((a, b) => a.category.order - b.category.order);
              })()}

              <div class="mt-6">
                <ContentCredentialStatus
                  provenanceData={selectedUpload.c2pa}
                  isLoading={selectedUpload.processing}
                />
              </div>

              <div class="mt-8 space-y-4 animate-in fade-in slide-in-from-top-2 bg-muted/30 p-4 rounded-lg">
                <div class="rounded-lg border bg-background/80 overflow-hidden">
                  <div class="px-4 py-3 border-b bg-muted/40">
                    <h3 class="text-base md:text-lg font-semibold flex items-center gap-2">
                      <ImageIcon class="h-5 w-5" />
                      Edit & History Summary
                    </h3>
                    <p class="text-xs md:text-sm text-muted-foreground mt-1">
                      This is the recorded history found in the file. It is grouped into plain-language sections to make the changes easier to read.
                    </p>
                    <p class="text-xs text-muted-foreground mt-1">
                      Action names describe what changed (like crop or delete). "AI-assisted" labels describe how that change was made.
                    </p>
                    <p class="text-xs text-muted-foreground mt-1 truncate">
                      File: {selectedUpload.file.name}
                    </p>
                  </div>

                  <div class="p-3 md:p-4 space-y-2">
                    {#each groupedActions as group}
                      <details class="group border rounded-lg bg-card text-card-foreground shadow-sm open:ring-1 open:ring-primary/20">
                        <summary
                          class="flex items-center justify-between p-4 cursor-pointer select-none hover:bg-muted/50 transition-colors rounded-lg group-open:rounded-b-none"
                        >
                          <div class="min-w-0">
                            <div class="flex items-center gap-3 font-medium">
                              <group.category.icon class="h-5 w-5 text-primary shrink-0" />
                              <span>{group.category.label}</span>
                              <span class="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-secondary-foreground">
                                {group.actions.length} {group.actions.length === 1 ? 'entry' : 'entries'}
                              </span>
                              {#if group.aiCount > 0}
                                <span class="inline-flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                                  <Sparkles class="h-3 w-3" />
                                  {group.aiCount} AI-tagged
                                </span>
                              {/if}
                            </div>
                            <p class="text-xs text-muted-foreground mt-1 pl-8">
                              {CATEGORY_EXPLANATIONS[group.category.label] || 'Recorded changes in this category.'}
                            </p>
                          </div>
                          <ChevronDown class="h-4 w-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180 shrink-0" />
                        </summary>

                        <div class="border-t bg-muted/10">
                          <ul class="divide-y">
                            {#each group.actions as action}
                              <li class="px-4 py-3">
                                <div class="flex items-start gap-3">
                                  <span class="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/50 shrink-0"></span>
                                  <div class="min-w-0 space-y-1">
                                    <p class="text-sm text-foreground leading-snug">
                                      {formatActionLine(action)}
                                    </p>
                                    {#if isAiAction(action) || getDigitalSourceTypeLabel(action)}
                                      <div class="flex flex-wrap items-center gap-1.5">
                                        {#if isAiAction(action)}
                                          <span class="inline-flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                                            <Sparkles class="h-3 w-3" />
                                            AI-assisted
                                          </span>
                                        {/if}
                                        {#if getDigitalSourceTypeLabel(action)}
                                          <span class="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                                            {getDigitalSourceTypeLabel(action)}
                                          </span>
                                        {/if}
                                      </div>
                                    {/if}
                                    <p class="text-[11px] text-muted-foreground break-all">
                                      Recorded action: {action.action}
                                    </p>
                                  </div>
                                </div>
                              </li>
                            {/each}
                          </ul>
                        </div>
                      </details>
                    {/each}

                    {#if groupedActions.length === 0}
                      <div class="p-4 border rounded-lg bg-muted/20 text-sm text-muted-foreground text-center">
                        No specific edit actions were listed in the file history.
                      </div>
                    {/if}
                  </div>
                </div>
              </div>
            {/if}

            <div class="flex flex-col-reverse items-stretch gap-4 pt-6 border-t md:flex-row md:items-center md:justify-between">
              <div class="flex-1 space-y-1.5">
                <div class="flex gap-4 text-sm font-medium flex-wrap">
                  <span class="flex items-center gap-1.5">
                    <CheckCircle class="h-4 w-4 text-green-500" /> {verifiedCount} Verified Capture
                  </span>

                  {#if captureUnknownCount > 0}
                    <span class="flex items-center gap-1.5">
                      <CheckCircle class="h-4 w-4 text-emerald-500" /> {captureUnknownCount} Capture (Unverified)
                    </span>
                  {/if}

                  {#if softwareSignedCount > 0}
                    <span class="flex items-center gap-1.5">
                      <FileImage class="h-4 w-4 text-blue-500" /> {softwareSignedCount} Signed by Software
                    </span>
                  {/if}

                  {#if unverifiedCount > 0}
                    <span class="flex items-center gap-1.5">
                      <XCircle class="h-4 w-4 text-amber-500" /> {unverifiedCount} Unsigned / Not Verified
                    </span>
                  {/if}
                </div>

                {#if unverifiedCount > 0 || softwareSignedCount > 0 || captureUnknownCount > 0}
                  <p class="text-xs text-muted-foreground pr-8">
                    <strong>Verified Capture:</strong> The photo&apos;s history is intact straight from a supported camera.
                    <br /><strong>Signed by Software:</strong> The photo has verified history, but it originated in software (like editing or AI tools) instead of a camera.
                    <br /><strong>Unsigned / Not Verified:</strong> The file is missing content credentials, or the signature could not be verified here.
                    {#if captureUnknownCount > 0}
                      <br /><strong>Capture (Unverified):</strong> Capture provenance was found, but this viewer could not independently verify the capture signature.
                    {/if}
                  </p>
                {/if}
              </div>

              {#if uploadableCount > 0}
                {@const totalUploadable = uploadableCount}
                <Button onclick={handleUpload} disabled={isUploading} class="w-full md:w-auto">
                    {#if isUploading}
                        <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                    {:else}
                        Upload {totalUploadable} {totalUploadable === 1 ? 'Image' : 'Images'}
                    {/if}
                </Button>
              {/if}
            </div>
          {/if}
        </CardContent>
      </div>
    </Card>
  </div>
{/if}
