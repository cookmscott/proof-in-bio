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

    let verifiedCount = $derived(uploads.filter(u => u.c2pa?.hasCaptureProvenance && u.c2pa?.activeSignatureValidated).length);
    let softwareSignedCount = $derived(uploads.filter(u => u.c2pa?.hasC2pa && !u.c2pa?.activeSignatureValidated && u.c2pa?.signatureValidated).length);
    let unverifiedCount = $derived(uploads.filter(u => !u.c2pa?.hasC2pa || !u.c2pa?.activeSignatureValidated).length);

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

        const validation_results = store?.validation_results ?? store?.validationResults ?? null;
        const validation_state = store?.validation_state ?? store?.validationState ?? null;

        return {
            active_manifest: active,
            manifests,
            validation_status,
            validation_results,
            validation_state
        };
    }

    /**
     * Extracts Actions based on C2PA Technical Specification.
     * Spec: Assertion label is 'c2pa.actions'.
     * Spec: Data structure is a map containing an 'actions' key (array of Action objects).
     */
    function parseActionsOrder(label = '') {
      // c2pa.actions.v2, c2pa.actions.v2__1, c2pa.actions__2, etc.
      const m = label.match(/__(\d+)$/);
      return m ? Number(m[1]) : 0;
    }

    function isActionsLabel(label = '') {
      return /^c2pa\.actions(\.v2)?(__\d+)?$/.test(label);
    }

    function applyActionTemplates(data) {
      const actions = Array.isArray(data?.actions) ? data.actions : [];
      const templates = data?.templates && typeof data.templates === 'object' ? data.templates : null;

      if (!templates) return actions;

      const star = templates['*'] && typeof templates['*'] === 'object' ? templates['*'] : {};

      return actions.map((a) => {
        const perAction = templates[a?.action] && typeof templates[a.action] === 'object'
          ? templates[a.action]
          : {};

        // Shallow merge + merge parameters (most important)
        const merged = {
          ...star,
          ...perAction,
          ...a,
          parameters: {
            ...(star.parameters || {}),
            ...(perAction.parameters || {}),
            ...(a?.parameters || {})
          }
        };

        return merged;
      });
    }

    function extractActionsAll(assertions = []) {
      if (!Array.isArray(assertions) || assertions.length === 0) {
        return { actionsLabels: [], actions: [] };
      }

      const actionAssertions = assertions
        .filter(a => isActionsLabel(a?.label || ''))
        .sort((a, b) => parseActionsOrder(a.label) - parseActionsOrder(b.label));

      const all = [];
      const labels = [];

      for (const asrt of actionAssertions) {
        labels.push(asrt.label);
        const data = asrt?.data || null;
        const normalized = applyActionTemplates(data);
        for (const act of normalized) all.push(act);
      }

      // Sort by `when` if present, otherwise preserve original order
      const hasWhen = all.some(a => a?.when);
      if (hasWhen) {
        all.sort((a, b) => {
          const ta = a?.when ? Date.parse(a.when) : NaN;
          const tb = b?.when ? Date.parse(b.when) : NaN;
          if (!Number.isNaN(ta) && !Number.isNaN(tb)) return ta - tb;
          if (!Number.isNaN(ta)) return -1;
          if (!Number.isNaN(tb)) return 1;
          return 0;
        });
      }

      return { actionsLabels: labels, actions: all };
    }

    function getManifestCaptureStatus(manifest) {
        const { actions } = extractActionsAll(manifest?.assertions || []);
        if (!actions.length) return false;

        const created = actions.find(a => a?.action === 'c2pa.created');
        if (!created) return false;

        // Requirement B: Read digitalSourceType from correct places
        const iptcUri = 'http://cv.iptc.org/newscodes/digitalsourcetype/';
        const rawType = 
            created.digitalSourceType ||
            created.parameters?.digitalSourceType ||
            created.parameters?.[iptcUri];

        if (!rawType) return false;

        // Requirement C: Recognize capture source types
        const t = String(rawType);
        // accept full URIs; match by suffix
        return t.endsWith('/digitalCapture') || t.endsWith('/computationalCapture');
    }

    function parseIngredientLabelFromUrl(url) {
      // Example: self#jumbf=c2pa.assertions/c2pa.ingredient.v3__1
      // or:     self#jumbf=/c2pa/urn:.../c2pa.assertions/c2pa.ingredient.v3
      if (!url || typeof url !== 'string') return null;

      const idx = url.lastIndexOf('c2pa.assertions/');
      if (idx === -1) return null;

      return url.substring(idx + 'c2pa.assertions/'.length);
    }

    function buildIngredientLabelIndex(manifest) {
      // Map ingredient assertion label -> ingredient entry (from manifest.ingredients array)
      const map = new Map();
      for (const ing of (manifest?.ingredients || [])) {
        const label = ing?.label;
        if (label) map.set(label, ing);
      }
      return map;
    }

    function extractParentManifestIdsFromActions(manifest) {
      const { actions } = extractActionsAll(manifest?.assertions || []);
      if (!actions.length) return [];

      const ingredientIndex = buildIngredientLabelIndex(manifest);
      const out = new Set();

      for (const act of actions) {
        const ings = act?.parameters?.ingredients;
        if (!Array.isArray(ings)) continue;

        for (const ingRef of ings) {
          const label = parseIngredientLabelFromUrl(ingRef?.url);
          if (!label) continue;

          // ingredient entries often use same label (including __1, __2)
          const entry = ingredientIndex.get(label) || ingredientIndex.get(label.replace(/__(\d+)$/, ''));
          const parentId =
            entry?.active_manifest ||
            entry?.activeManifest ||
            entry?.manifest_id ||
            entry?.manifestId ||
            null;

          if (parentId) out.add(parentId);
        }
      }

      return [...out];
    }

    function extractParentManifestIds(manifest) {
      // Combine “easy” top-level ingredient list + spec-aligned action ingredient refs
      const out = new Set();

      // 1) direct ingredient list (good fallback)
      for (const ing of (manifest?.ingredients || [])) {
        const parentId =
          ing?.active_manifest ||
          ing?.activeManifest ||
          ing?.manifest_id ||
          ing?.manifestId ||
          null;
        if (parentId) out.add(parentId);
      }

      // 2) hashed-uri references from actions (spec-aligned)
      for (const parentId of extractParentManifestIdsFromActions(manifest)) out.add(parentId);

      return [...out];
    }

    function analyzeProvenance(store) {
        if (!store || !store.manifests) return { hasC2pa: false };

        const activeId = store.active_manifest;
        const activeManifest = store.manifests?.[activeId];
        if (!activeManifest) return { hasC2pa: false };

        // IMPORTANT: require actions assertions to call it “hasC2pa” for your UX
        const { actions: activeActions } = extractActionsAll(activeManifest.assertions || []);
        const hasC2pa = activeActions.length > 0;

        const activeIsCapture = getManifestCaptureStatus(activeManifest);
        let hasCaptureProvenance = activeIsCapture;
        let captureManifest = activeIsCapture ? activeManifest : null;

        if (!hasCaptureProvenance) {
            const queue = extractParentManifestIds(activeManifest);
            const visited = new Set([activeId]);

            while (queue.length) {
              const parentId = queue.shift();
              if (!parentId || visited.has(parentId)) continue;

              const parent = store.manifests?.[parentId];
              if (!parent) continue;

              visited.add(parentId);

              if (getManifestCaptureStatus(parent)) {
                hasCaptureProvenance = true;
                captureManifest = parent;
                break;
              }

              // keep walking up
              for (const nextId of extractParentManifestIds(parent)) {
                if (nextId && !visited.has(nextId)) queue.push(nextId);
              }
            }
        }

        const getSigner = (m) =>
            m?.signature_info?.common_name ||
            m?.signature_info?.issuer ||
            'Unknown';

        // Validation (active manifest only, unless your lib exposes per-manifest results)
        const vr = store.validation_results?.activeManifest;
        const failures = vr?.failure || [];
        const successes = vr?.success || [];

        const hasCryptoFailure = failures.some(f =>
            (f.code || '').startsWith('claimSignature.') ||
            (f.code || '').startsWith('assertion.dataHash.') ||
            (f.code || '').startsWith('assertion.hashedURI.')
        );

        const activeSignatureValidated =
            !!successes.find(s => (s.code || '') === 'claimSignature.validated') && !hasCryptoFailure;

        const signingCredentialTrusted =
            !failures.some(f => (f.code || '') === 'signingCredential.untrusted');

        return {
            hasC2pa,
            hasCaptureProvenance,
            activeIsCapture,
            activeSigner: getSigner(activeManifest),
            captureSigner: captureManifest ? getSigner(captureManifest) : null,

            // keep your existing flag name, but make it explicit too
            signatureValidated: activeSignatureValidated,
            activeSignatureValidated,
            signingCredentialTrusted,

            // UI: show actions from active (edits) chain
            actions: activeActions
        };
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
            let analysis = null;

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

                    // Run the full provenance analysis
                    analysis = analyzeProvenance(normalized);

                    // --- LOGGING ---
                    // Log strict C2PA data to console as requested
                    console.group(`C2PA Analysis: ${uploadItem.file.name}`);
                    console.log('Analysis Result:', analysis);
                    console.log('Manifest Store (Raw):', manifestStore);
                    console.log('Active Manifest ID:', activeId);
                    console.log('Active Manifest Data:', normalized.manifests[activeId]);
                    
                    console.groupEnd();
                    // --- END LOGGING ---
                }
            }

            const index = uploads.findIndex(u => u.id === uploadItem.id);
            if (index !== -1) {
                uploads[index].c2pa = { 
                    ...analysis,
                    data: manifestData 
                };
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
                                    {#if upload.c2pa.hasCaptureProvenance && upload.c2pa.activeSignatureValidated}
                                        <div class="bg-green-500 text-white p-1.5 rounded-full shadow-sm" title="Verified Capture (Device Signed)">
                                            <CheckCircle class="h-5 w-5" />
                                        </div>
                                    {:else if upload.c2pa.hasC2pa && upload.c2pa.signatureValidated}
                                        <div class="bg-blue-500 text-white p-1.5 rounded-full shadow-sm" title="Signed by Software (Not Capture)">
                                            <FileImage class="h-5 w-5" />
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

                {#if selectedUpload && selectedUpload.c2pa?.hasC2pa}
                    {@const groupedActions = (() => {
                        const groups = {};
                        for (const action of (selectedUpload.c2pa.actions || [])) {
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
                                <CheckCircle class="h-4 w-4 text-green-500" /> {verifiedCount} Captured
                            </span>
                            {#if softwareSignedCount > 0}
                                <span class="flex items-center gap-1.5">
                                    <FileImage class="h-4 w-4 text-blue-500" /> {softwareSignedCount} Edited/Software
                                </span>
                            {/if}
                            {#if unverifiedCount > 0}
                                <span class="flex items-center gap-1.5">
                                    <XCircle class="h-4 w-4 text-amber-500" /> {unverifiedCount} Unsigned
                                </span>
                            {/if}
                        </div>
                        {#if unverifiedCount > 0 || softwareSignedCount > 0}
                            <p class="text-xs text-muted-foreground">
                                Only images signed at the point of capture are marked as Verified.
                            </p>
                        {/if}
                    </div>
                    {#if verifiedCount > 0}
                        <Button>Upload {verifiedCount} Verified {verifiedCount === 1 ? 'Image' : 'Images'}</Button>
                    {/if}
                </div>
            {/if}
        </CardContent>
    </Card>
</div>