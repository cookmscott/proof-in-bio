<script>
    import { Button } from '$lib/ui/button';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/ui/card';
    import { Upload, Loader2, CheckCircle, XCircle, FileImage, AlertCircle, Image as ImageIcon } from 'lucide-svelte';

    let dragOver = $state(false);
    let uploads = $state([]);
    let c2paInstance = null;
    let fileInput = $state(null);
    let error = $state(null);

    let verifiedCount = $derived(uploads.filter(u => u.c2pa?.valid).length);
    let unverifiedCount = $derived(uploads.filter(u => u.c2pa && !u.c2pa.valid).length);

    const C2PA_VERSION = '0.5.6';

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
        error = null; // Clear previous errors

        // Requirement: only allow 10 images uploading at a time.
        if (fileList.length > 10) {
            error = "Please select 10 or fewer images at a time.";
            return;
        }

        // Requirement: check that there are no duplicates
        const existingFileIds = new Set(uploads.map(u => `${u.file.name}|${u.file.size}|${u.file.lastModified}`));

        const filesToProcess = Array.from(fileList).filter(f => {
            if (!f.type.startsWith('image/')) {
                return false;
            }
            const fileId = `${f.name}|${f.size}|${f.lastModified}`;
            if (existingFileIds.has(fileId)) {
                return false;
            }
            // Add to set to also catch duplicates within the same selection batch
            existingFileIds.add(fileId);
            return true;
        });

        if (fileList.length > 0 && filesToProcess.length === 0) {
            error = "All selected images are already in the list or are not valid image types.";
            return;
        }

        if (filesToProcess.length === 0) {
            return;
        }

        const newUploads = filesToProcess
            .map(f => ({
                id: Math.random().toString(36).substring(7),
                file: f,
                previewUrl: URL.createObjectURL(f),
                processing: true,
                c2pa: null,
                error: null
            }));

        uploads = [...uploads, ...newUploads];

        for (const upload of newUploads) {
            processSingleUpload(upload);
        }
    }

    async function processSingleUpload(uploadItem) {
        try {
            const c2pa = await loadC2pa();
            const result = await c2pa.reader.fromBlob(uploadItem.file.type, uploadItem.file);
            
            let hasManifest = false;
            let manifestData = null;

            if (result) {
                const manifestStore = await result.manifestStore();

                // "Has C2PA" = there is at least one manifest in the store
                const manifestsObj = manifestStore?.manifests ?? manifestStore?.manifests_map ?? null;
                const manifestIds = manifestsObj ? Object.keys(manifestsObj) : [];
                const hasC2pa = manifestIds.length > 0;

                // (optional) sanity: active_manifest should point at an existing manifest id
                let activeId = manifestStore?.active_manifest;
                if (activeId && typeof activeId === 'object' && activeId.label) activeId = activeId.label;
                const activeExists = !!activeId && manifestIds.includes(activeId);

                hasManifest = hasC2pa && (activeId ? activeExists : true);

                if (hasManifest) {
                    manifestData = manifestStore;
                }
            }

            const index = uploads.findIndex(u => u.id === uploadItem.id);
            if (index !== -1) {
                uploads[index].c2pa = { valid: hasManifest, data: manifestData };
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
                        <div class="relative aspect-square rounded-lg overflow-hidden border bg-muted/30 group">
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
                                Some of your images may not have C2PA and will not be uploaded. <a href="/articles/what-is-c2pa" class="underline hover:text-foreground">LEARN MORE</a>
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