<script>
    import { Button } from '$lib/ui/button';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/ui/card';
    import { 
        Upload, Loader2, CheckCircle, XCircle, FileImage, AlertCircle, Image as ImageIcon,
        PlusCircle, Paintbrush, Settings2, Sparkles, Gauge, AudioWaveform, Code, 
        MoveDiagonal, SquareStack, Rss, ListMinus, ShieldCheck, Type, ChevronDown
    } from 'lucide-svelte';

    let dragOver = $state(false);
    let uploads = $state([]);
    let c2paInstance = null;
    let fileInput = $state(null);
    let error = $state(null);
    let selectedUpload = $state(null);

    let verifiedCount = $derived(uploads.filter(u => u.c2pa?.valid).length);
    let unverifiedCount = $derived(uploads.filter(u => u.c2pa && !u.c2pa.valid).length);

    // Using a stable version for c2pa-web
    const C2PA_VERSION = '0.5.6';

    const ACTION_CATEGORIES = {
        'c2pa.created': { order: 1, label: 'Creation & Ingestion', icon: PlusCircle },
        'c2pa.opened': { order: 1, label: 'Creation & Ingestion', icon: PlusCircle },
        'c2pa.placed': { order: 2, label: 'Editorial Content Changes', icon: Paintbrush },
        'c2pa.edited': { order: 2, label: 'Editorial Content Changes', icon: Paintbrush },
        'c2pa.color_adjustments': { order: 3, label: 'Color & Tone Adjustments', icon: Settings2 },
        'c2pa.filtered': { order: 4, label: 'Enhancement (Non-Editorial)', icon: Sparkles },
        // Speed & Timing (5) - c2pa.speed? c2pa.timing?
        // Audio Production (6) - c2pa.audio?
        'c2pa.metadata': { order: 7, label: 'Metadata-Only Changes', icon: Code },
        'c2pa.cropped': { order: 8, label: 'Resizing & Scaling', icon: MoveDiagonal },
        'c2pa.resized': { order: 8, label: 'Resizing & Scaling', icon: MoveDiagonal },
        'c2pa.orientation': { order: 8, label: 'Resizing & Scaling', icon: MoveDiagonal },
        'c2pa.converted': { order: 9, label: 'File / Format Transformations', icon: SquareStack },
        'c2pa.transcoded': { order: 9, label: 'File / Format Transformations', icon: SquareStack },
        'c2pa.published': { order: 10, label: 'Publishing & Distribution', icon: Rss },
        'c2pa.redacted': { order: 11, label: 'Removal & Redaction', icon: ListMinus },
        'c2pa.removed': { order: 11, label: 'Removal & Redaction', icon: ListMinus },
        'c2pa.watermarked': { order: 12, label: 'Watermarking', icon: ShieldCheck },
        // Font-Specific (13)
    };

    function getActionCategory(actionId) {
        return ACTION_CATEGORIES[actionId] || { order: 99, label: 'Other Actions', icon: Code };
    }

    function formatActionParameter(action) {
        const params = action.parameters;
        if (!params) return null;
        
        // Handle Adobe ACR specific parameters
        if (params['com.adobe.acr']) {
            const name = params['com.adobe.acr'];
            const value = params['com.adobe.acr.value'];
            return value ? `${name}: ${value}` : name;
        }
        
        // Handle ingredients (e.g. c2pa.opened)
        if (params.ingredients) {
            return `Imported ${params.ingredients.length} asset(s)`;
        }

        // Generic fallback
        const keys = Object.keys(params).filter(k => k !== 'instance_id');
        if (keys.length > 0) return keys.join(', ');
        return null;
    }

    /**
     * Normalizes the manifest store for UI consumption.
     * Retains original data structures for logging.
     */
    function normalizeManifestStore(store) {
        // C2PA library may return snake_case or camelCase depending on version/context.
        const manifests =
            store?.manifests ??
            store?.manifests_map ??
            store?.manifestsMap ??
            {};

        let active =
            store?.active_manifest ??
            store?.activeManifest ??
            null;

        // Ensure active is just the ID string
        if (active && typeof active === 'object' && active.label) active = active.label;

        const validation_status =
            store?.validation_status ??
            store?.validationStatus ??
            [];

        return {
            active_manifest: active,
            manifests,
            validation_status
        };
    }

    /**
     * Extracts Actions based on C2PA Technical Specification.
     * Spec: Assertion label is 'c2pa.actions'.
     * Spec: Data structure is a map containing an 'actions' key (array of Action objects).
     */
    function extractActions(assertions = []) {
        if (!assertions || assertions.length === 0) return { actionsLabel: null, actions: [] };

        // Per Spec: The standard label for the Actions Assertion is 'c2pa.actions'.
        // We prioritize an exact match. 
        let actionAssertion = assertions.find(a => a.label === 'c2pa.actions');

        // Fallback: If strict 'c2pa.actions' is not found, look for namespaced versions (e.g., c2pa.actions.v2)
        // only if strictly necessary. Ideally, valid C2PA 2.0+ content still uses 'c2pa.actions' 
        // or a clearly defined versioned label.
        if (!actionAssertion) {
            actionAssertion = assertions.find(a => a.label && a.label.startsWith('c2pa.actions'));
        }

        if (actionAssertion) {
            // Per Spec: The payload of the Actions assertion contains an 'actions' field.
            const data = actionAssertion.data;
            
            // Strict check: data must be an object and have an 'actions' array.
            if (data && Array.isArray(data.actions)) {
                return { 
                    actionsLabel: actionAssertion.label, 
                    actions: data.actions 
                };
            }
        }

        return { actionsLabel: null, actions: [] };
    }

    async function loadC2pa() {
        if (c2paInstance) return c2paInstance;

        try {
            const module = await import(`https://cdn.jsdelivr.net/npm/@contentauth/c2pa-web@${C2PA_VERSION}/+esm`);
            const createC2pa = module.createC2pa;
            
            c2paInstance = await createC2pa({
                wasmSrc: `https://cdn.jsdelivr.net/npm/@contentauth/c2pa-web@${C2PA_VERSION}/dist/resources/c2pa_bg.wasm`
            });
            return c2paInstance;
        } catch (err) {
            console.error("Failed to load C2PA library", err);
            throw new Error("Failed to load C2PA library. Please check your internet connection.");
        }
    }

    async function processFiles(fileList) {
        if (!fileList || fileList.length === 0) return;
        error = null;

        if (fileList.length > 10) {
            error = "Please select 10 or fewer images at a time.";
            return;
        }

        const existingFileIds = new Set(uploads.map(u => `${u.file.name}|${u.file.size}|${u.file.lastModified}`));

        const filesToProcess = Array.from(fileList).filter(f => {
            if (!f.type.startsWith('image/')) return false;
            const fileId = `${f.name}|${f.size}|${f.lastModified}`;
            if (existingFileIds.has(fileId)) return false;
            existingFileIds.add(fileId);
            return true;
        });

        if (fileList.length > 0 && filesToProcess.length === 0) {
            error = "All selected images are already in the list or are not valid image types.";
            return;
        }

        if (filesToProcess.length === 0) return;

        const newUploads = filesToProcess.map(f => ({
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
            
            let hasManifest = false;
            let manifestData = null;
            let extractedActions = [];

            if (result) {
                // Get the raw manifest store
                const manifestStore = await result.manifestStore();
                
                // Helper to normalize keys for UI checks
                const normalized = normalizeManifestStore(manifestStore);
                const manifestIds = Object.keys(normalized.manifests || {});
                
                // Determine existence of C2PA data
                const hasC2pa = manifestIds.length > 0;
                
                // Verify active manifest points to real data
                const activeId = normalized.active_manifest;
                const activeExists = !!activeId && manifestIds.includes(activeId);

                hasManifest = hasC2pa && (activeId ? activeExists : true);

                if (hasManifest) {
                    manifestData = manifestStore;

                    // Get the specific Active Manifest object
                    const activeManifest = normalized.manifests[activeId];
                    
                    // Extract actions conforming to Spec
                    const { actionsLabel, actions } = extractActions(activeManifest?.assertions || []);
                    extractedActions = actions;

                    // --- LOGGING ---
                    // Log strict C2PA data to console as requested
                    console.group(`C2PA Analysis: ${uploadItem.file.name}`);
                    console.log('Manifest Store (Raw):', manifestStore);
                    console.log('Active Manifest ID:', activeId);
                    console.log('Active Manifest Data:', activeManifest);
                    
                    if (actionsLabel) {
                        console.log(`Actions Assertion Found (${actionsLabel}):`, actions);
                        // Log specific details often requested in specs (action, software agent, etc)
                        actions.forEach((action, i) => {
                            console.log(`[Action ${i}] ${action.action}`, action);
                        });
                    } else {
                        console.warn('No "c2pa.actions" assertion found in active manifest.');
                    }
                    console.groupEnd();
                    // --- END LOGGING ---
                }
            }

            const index = uploads.findIndex(u => u.id === uploadItem.id);
            if (index !== -1) {
                uploads[index].c2pa = { valid: hasManifest, data: manifestData, actions: extractedActions };
                uploads[index].processing = false;
            }
        } catch (err) {
            console.error("Error processing image:", err);
            const index = uploads.findIndex(u => u.id === uploadItem.id);
            if (index !== -1) {
                uploads[index].error = "Failed to process";
                uploads[index].processing = false;
            }
        }
    }

    function handleDrop(e) {
        e.preventDefault();
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
</script>

<div class="container mx-auto max-w-2xl py-12 px-4">
    <Card>
        <CardHeader>
            <CardTitle>Upload Images</CardTitle>
            <CardDescription>Upload images to verify their C2PA metadata locally in your browser.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-6">
            
            <div 
                role="button"
                tabindex="0"
                class="relative flex flex-col items-center justify-center w-full h-64 rounded-xl border-2 border-dashed transition-colors cursor-pointer outline-none
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
                    <div class="p-4 rounded-full bg-muted">
                        <Upload class="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div class="space-y-1">
                        <p class="text-sm font-medium">
                            Drag & drop or click to upload multiple images
                        </p>
                        <p class="text-xs text-muted-foreground">
                            Supports JPEG, PNG, WebP
                        </p>
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
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4">
                    {#each uploads as upload (upload.id)}
                        <div 
                            class="relative aspect-square rounded-lg overflow-hidden border bg-muted/30 group cursor-pointer transition-all {selectedUpload?.id === upload.id ? 'ring-2 ring-primary ring-offset-2' : 'hover:border-primary/50'}"
                            onclick={() => selectedUpload = upload}
                            onkeydown={(e) => e.key === 'Enter' && (selectedUpload = upload)}
                            role="button"
                            tabindex="0"
                        >
                            <img src={upload.previewUrl} alt={upload.file.name} class="w-full h-full object-cover" />
                            
                            {#if upload.processing}
                                <div class="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                                    <Loader2 class="h-8 w-8 animate-spin text-primary" />
                                </div>
                            {:else if upload.c2pa}
                                <div class="absolute top-2 right-2">
                                    {#if upload.c2pa.valid}
                                        <div class="bg-green-500 text-white p-1.5 rounded-full shadow-sm" title="Verified C2PA">
                                            <CheckCircle class="h-5 w-5" />
                                        </div>
                                    {:else}
                                        <div class="bg-amber-500 text-white p-1.5 rounded-full shadow-sm" title="No C2PA">
                                            <XCircle class="h-5 w-5" />
                                        </div>
                                    {/if}
                                </div>
                            {:else if upload.error}
                                <div class="absolute top-2 right-2">
                                    <div class="bg-destructive text-destructive-foreground p-1.5 rounded-full shadow-sm" title={upload.error}>
                                        <AlertCircle class="h-5 w-5" />
                                    </div>
                                </div>
                            {/if}
                            
                            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p class="text-white text-xs truncate font-medium">{upload.file.name}</p>
                                <p class="text-white/70 text-[10px]">{(upload.file.size / 1024).toFixed(0)} KB</p>
                            </div>
                        </div>
                    {/each}
                </div>

                {#if selectedUpload && selectedUpload.c2pa?.valid}
                    {@const groupedActions = (() => {
                        const groups = {};
                        for (const action of selectedUpload.c2pa.actions) {
                            const category = getActionCategory(action.action);
                            const key = category.label;
                            if (!groups[key]) groups[key] = { category, actions: [] };
                            groups[key].actions.push(action);
                        }
                        return Object.values(groups).sort((a, b) => a.category.order - b.category.order);
                    })()}

                    <div class="mt-8 space-y-4 animate-in fade-in slide-in-from-top-2">
                        <h3 class="text-lg font-semibold flex items-center gap-2">
                            <ImageIcon class="h-5 w-5" />
                            Edits for {selectedUpload.file.name}
                        </h3>
                        
                        <div class="space-y-2">
                            {#each groupedActions as group}
                                <details class="group border rounded-lg bg-card text-card-foreground shadow-sm open:ring-1 open:ring-primary/20">
                                    <summary class="flex items-center justify-between p-4 cursor-pointer select-none font-medium hover:bg-muted/50 transition-colors rounded-lg group-open:rounded-b-none">
                                        <div class="flex items-center gap-3">
                                            <group.category.icon class="h-5 w-5 text-primary" />
                                            {group.category.label}
                                        </div>
                                        <ChevronDown class="h-4 w-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
                                    </summary>
                                    <div class="p-4 pt-0 border-t bg-muted/10">
                                        <ul class="space-y-2 mt-4">
                                            {#each group.actions as action}
                                                <li class="text-sm text-muted-foreground flex items-start gap-2">
                                                    <span class="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/50 shrink-0"></span>
                                                    <span>{formatActionParameter(action) || action.action}</span>
                                                </li>
                                            {/each}
                                        </ul>
                                    </div>
                                </details>
                            {/each}
                            {#if groupedActions.length === 0}
                                <div class="p-4 border rounded-lg bg-muted/20 text-sm text-muted-foreground text-center">
                                    No specific edit actions found in the manifest.
                                </div>
                            {/if}
                        </div>
                    </div>
                {/if}

                <div class="flex items-center justify-between pt-6 border-t">
                    <div class="flex-1 space-y-1.5">
                        <div class="flex gap-4 text-sm font-medium">
                            <span class="flex items-center gap-1.5">
                                <CheckCircle class="h-4 w-4 text-green-500" /> {verifiedCount} Verified
                            </span>
                            {#if unverifiedCount > 0}
                                <span class="flex items-center gap-1.5">
                                    <XCircle class="h-4 w-4 text-amber-500" /> {unverifiedCount} No C2PA
                                </span>
                            {/if}
                        </div>
                        {#if unverifiedCount > 0}
                            <p class="text-xs text-muted-foreground">
                                Some of your images may not have C2PA and will not be uploaded.
                            </p>
                        {/if}
                    </div>
                    {#if verifiedCount > 0}
                        <Button>Upload {verifiedCount} {verifiedCount === 1 ? 'Image' : 'Images'}</Button>
                    {/if}
                </div>
            {/if}

        </CardContent>
    </Card>
</div>