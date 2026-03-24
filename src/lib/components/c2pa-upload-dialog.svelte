<script>
	import { env } from '$env/dynamic/public';
	import { Button } from '$lib/ui/button';
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/ui/card';
	import {
		Upload,
		Loader2,
		CheckCircle,
		XCircle,
		AlertCircle,
		X,
		Sparkles,
		Camera,
		Paintbrush
	} from 'lucide-svelte';

	import {
		normalizeManifestStore,
		analyzeProvenance,
		loadC2pa,
		getSimpleC2paStatus
	} from '$lib/c2pa';

	// Props
	let { open = $bindable(false), supabase, onUploadComplete, allowAllPhotos = false } = $props();

	let dragOver = $state(false);
	let uploads = $state([]);
	let fileInput = $state(null);
	let error = $state(null);
	let selectedUpload = $state(null);
	let isUploading = $state(false);
	const C2PA_READ_TIMEOUT_MS = 15000;
	const UPLOAD_REQUEST_TIMEOUT_MS = 45000;
	const SUPPORTED_C2PA_TYPES = new Set([
		'image/jpeg',
		'image/jpg',
		'image/png',
		'image/webp',
		'image/tiff'
	]);
	const uploadApiUrl = env.PUBLIC_UPLOAD_API_URL;

	// --- Simple C2PA status helpers ---
	const hasC2pa = (u) => !!u?.c2pa;
	const getSimpleStatus = (u) => getSimpleC2paStatus(u?.c2pa);
	const isConfirmedCapture = (u) => getSimpleStatus(u).confirmedCapture;
	const isEditedWithNonAi = (u) => getSimpleStatus(u).editedWithNonAi;
	const isEditedWithAi = (u) => getSimpleStatus(u).editedWithAi;
	const isEligibleByStatus = (u) => {
		const s = getSimpleStatus(u);
		return s.confirmedCapture || s.editedWithNonAi || s.editedWithAi;
	};
	const isUnverified = (u) => !isEligibleByStatus(u);

	let captureCount = $derived(uploads.filter(isConfirmedCapture).length);
	let nonAiEditCount = $derived(uploads.filter(isEditedWithNonAi).length);
	let aiEditCount = $derived(uploads.filter(isEditedWithAi).length);
	let unverifiedCount = $derived(uploads.filter(isUnverified).length);
	let uploadableCount = $derived(
		allowAllPhotos
			? uploads.filter((u) => !u.processing && !u.error).length
			: uploads.filter((u) => !u.processing && !u.error && isEligibleByStatus(u)).length
	);

	$effect(() => {
		supabase.auth.getSession().then(({ data }) => {
			console.log('Current Session:', data.session);
			// If this is null, your UI needs to force a login first.
		});
	});

	$effect(() => {
		if (!open) {
			dragOver = false;
		}
	});

	function withTimeout(promise, timeoutMs, message) {
		return new Promise((resolve, reject) => {
			const timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);
			promise
				.then((value) => {
					clearTimeout(timeoutId);
					resolve(value);
				})
				.catch((err) => {
					clearTimeout(timeoutId);
					reject(err);
				});
		});
	}

	async function handleUpload() {
		// Allow upload if we have any eligible C2PA statuses.
		const canUploadCount = uploadableCount;
		if (isUploading || canUploadCount === 0) return;

		// Check if we have a valid session before starting
		const {
			data: { session }
		} = await supabase.auth.getSession();

		if (!session) {
			error = 'You must be logged in to upload photos.';
			return;
		}

		if (!uploadApiUrl) {
			error = 'Upload API is not configured.';
			return;
		}

		isUploading = true;
		error = null;

		// Filter for eligible C2PA statuses, unless testing flag is enabled
		const uploadsToProcess = allowAllPhotos
			? uploads.filter((u) => !u.processing && !u.error)
			: uploads.filter((u) => !u.processing && !u.error && isEligibleByStatus(u));
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

				const formData = new FormData();
				formData.append('file', upload.file);

				const response = await withTimeout(
					fetch(uploadApiUrl, {
						method: 'POST',
						headers: {
							Authorization: `Bearer ${session.access_token}`
						},
						body: formData
					}),
					UPLOAD_REQUEST_TIMEOUT_MS,
					'Upload request timed out'
				);

				if (!response.ok) {
					let detail = 'Upload failed';
					try {
						const payload = await response.json();
						detail = payload?.detail || payload?.title || detail;
					} catch {
						// Fall back to the generic error message when the response is not JSON.
					}
					throw new Error(detail);
				}

				await response.json();

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

		const existingFileIds = new Set(
			uploads.map((u) => `${u.file.name}|${u.file.size}|${u.file.lastModified}`)
		);

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

		await Promise.allSettled(newUploads.map((upload) => processSingleUpload(upload)));
	}

	async function processSingleUpload(uploadItem) {
		try {
			const fileType = (uploadItem.file.type || '').toLowerCase();
			const index = uploads.findIndex((u) => u.id === uploadItem.id);
			if (index === -1) return;

			// Skip C2PA parsing for image types that are commonly unsupported by the browser/WASM parser on mobile.
			if (!SUPPORTED_C2PA_TYPES.has(fileType)) {
				uploads[index].c2pa = { hasManifest: false, hasActions: false, actions: [] };
				uploads[index].processing = false;
				return;
			}

			const c2pa = await withTimeout(
				loadC2pa(),
				C2PA_READ_TIMEOUT_MS,
				'C2PA initialization timed out'
			);
			const result = await withTimeout(
				c2pa.reader.fromBlob(uploadItem.file.type, uploadItem.file),
				C2PA_READ_TIMEOUT_MS,
				'C2PA read timed out'
			);

			let manifestData = null;
			let analysis = {
				hasManifest: false
			};

			if (result) {
				// Raw manifest store (as returned by the library)
				const manifestStore = await withTimeout(
					result.manifestStore(),
					C2PA_READ_TIMEOUT_MS,
					'C2PA manifest read timed out'
				);

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
				uploads[index].c2pa = { hasManifest: false, hasActions: false, actions: [] };
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
					<CardDescription class="mb-3"
						>Upload images and send them to the Lambda verifier. Local C2PA checks here are
						preview-only.</CardDescription
					>
					{#if allowAllPhotos}
						<p class="text-sm font-semibold text-red-500">C2PA checks are disabled for testing.</p>
					{/if}
				</CardHeader>

				<CardContent class="space-y-6">
					<div
						role="button"
						tabindex="0"
						class="relative flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed transition-colors cursor-pointer outline-none
            {dragOver
							? 'border-primary bg-primary/5'
							: 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'}"
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
						<div
							class="rounded-md bg-destructive/10 p-4 text-sm text-destructive flex items-center gap-2 animate-in fade-in"
						>
							<AlertCircle class="h-4 w-4" />
							{error}
						</div>
					{/if}

					{#if uploads.length > 0}
						<div
							class="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4"
						>
							{#each uploads as upload (upload.id)}
								<div
									class="relative aspect-square rounded-lg overflow-hidden border bg-muted/30 group cursor-pointer transition-all
                  {selectedUpload?.id === upload.id
										? 'ring-2 ring-primary ring-offset-2'
										: 'hover:border-primary/50'}"
									onclick={() => (selectedUpload = upload)}
									onkeydown={(e) => e.key === 'Enter' && (selectedUpload = upload)}
									role="button"
									tabindex="0"
								>
									<img
										src={upload.previewUrl}
										alt={upload.file.name}
										class="w-full h-full object-cover"
									/>

									{#if upload.processing}
										<div
											class="absolute rounded-lg inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm"
										>
											<Loader2 class="h-8 w-8 animate-spin text-primary" />
										</div>
									{:else if upload.error}
										<div class="absolute top-2 right-2">
											<div
												class="bg-destructive text-destructive-foreground p-1.5 rounded-full shadow-sm"
												title={upload.error}
											>
												<AlertCircle class="h-5 w-5" />
											</div>
										</div>
									{:else if hasC2pa(upload)}
										<div class="absolute top-2 right-2">
											{#if isConfirmedCapture(upload)}
												<div
													class="bg-green-500 text-white p-1.5 rounded-full shadow-sm"
													title="Media captured with camera"
												>
													<CheckCircle class="h-5 w-5" />
												</div>
											{:else if isEditedWithAi(upload)}
												<div
													class="bg-amber-500 text-white p-1.5 rounded-full shadow-sm"
													title="Edited with AI"
												>
													<Sparkles class="h-5 w-5" />
												</div>
											{:else if isEditedWithNonAi(upload)}
												<div
													class="bg-blue-500 text-white p-1.5 rounded-full shadow-sm"
													title="Edited with non-AI tools"
												>
													<CheckCircle class="h-5 w-5" />
												</div>
											{:else}
												<div
													class="bg-amber-500 text-white p-1.5 rounded-full shadow-sm"
													title="No verified C2PA signature"
												>
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
										<p class="text-white/70 text-[10px]">
											{(upload.file.size / 1024).toFixed(0)} KB
										</p>
									</div>
								</div>
							{/each}
						</div>

						{#if selectedUpload && hasC2pa(selectedUpload)}
							{@const status = getSimpleStatus(selectedUpload)}
							<div class="mt-8 bg-muted/30 p-4 rounded-lg">
								<div class="rounded-lg border bg-background/80 overflow-hidden">
									<div class="px-4 py-3 border-b bg-muted/40">
										<h3 class="text-base md:text-lg font-semibold">C2PA Summary</h3>
										<p class="text-xs md:text-sm text-muted-foreground mt-1 truncate">
											File: {selectedUpload.file.name}
										</p>
									</div>
									<div class="p-4 text-sm">
										<ul class="space-y-2">
											<li
												class={`flex items-center gap-2 ${status.confirmedCapture ? 'text-green-700 dark:text-green-400 font-medium' : 'text-muted-foreground opacity-60'}`}
											>
												<Camera class="h-4 w-4 shrink-0" />
												<span>Media captured with camera</span>
											</li>
											<li
												class={`flex items-center gap-2 ${status.editedWithNonAi ? 'text-blue-700 dark:text-blue-400 font-medium' : 'text-muted-foreground opacity-60'}`}
											>
												<Paintbrush class="h-4 w-4 shrink-0" />
												<span>Edited with non-AI tools</span>
											</li>
											<li
												class={`flex items-center gap-2 ${status.editedWithAi ? 'text-amber-700 dark:text-amber-400 font-medium' : 'text-muted-foreground opacity-60'}`}
											>
												<Sparkles class="h-4 w-4 shrink-0" />
												<span>Edited with AI</span>
											</li>
										</ul>
										{#if !status.confirmedCapture && !status.editedWithNonAi && !status.editedWithAi}
											<p class="text-xs text-muted-foreground mt-3">
												No matching verified C2PA status was found.
											</p>
										{/if}
									</div>
								</div>
							</div>
						{/if}

						<div
							class="flex flex-col-reverse items-stretch gap-4 pt-6 border-t md:flex-row md:items-center md:justify-between"
						>
							<div class="flex-1 space-y-1.5">
								<div class="flex gap-4 text-sm font-medium flex-wrap">
									<span class="flex items-center gap-1.5">
										<CheckCircle class="h-4 w-4 text-green-500" />
										{captureCount} Media captured with camera
									</span>

									{#if nonAiEditCount > 0}
										<span class="flex items-center gap-1.5">
											<CheckCircle class="h-4 w-4 text-blue-500" />
											{nonAiEditCount} Edited with non-AI tools
										</span>
									{/if}

									{#if aiEditCount > 0}
										<span class="flex items-center gap-1.5">
											<Sparkles class="h-4 w-4 text-amber-500" />
											{aiEditCount} Edited with AI
										</span>
									{/if}

									{#if unverifiedCount > 0}
										<span class="flex items-center gap-1.5">
											<XCircle class="h-4 w-4 text-amber-500" />
											{unverifiedCount} Unsigned / Not Verified
										</span>
									{/if}
								</div>

								{#if unverifiedCount > 0}
									<p class="text-xs text-muted-foreground pr-8">
										Some files did not match a verified C2PA status and cannot be uploaded.
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
