<script>
	import { Button } from '$lib/ui/button';
    import { page } from '$app/stores';
	import {
        Root as Tabs,
        List as TabsList,
        Trigger as TabsTrigger,
        Content as TabsContent
    } from '$lib/ui/tabs';
    import { Separator } from '$lib/ui/separator';
    import { Badge } from '$lib/ui/badge';
	import {
		Root as Avatar,
		Image as AvatarImage,
		Fallback as AvatarFallback
	} from '$lib/ui/avatar';
	import {
        Root as Accordion,
        Item as AccordionItem,
        Trigger as AccordionTrigger,
        Content as AccordionContent
    } from '$lib/ui/accordion';
    import {
        getActionCategory,
        formatActionParameter,
        normalizeManifestStore,
        analyzeProvenance,
        isAiAction
    } from '$lib/c2pa';
    import { 
        Download, Camera, ArrowLeft,
        MapPin, Calendar, HardDrive, FileImage, Aperture, Maximize, Focus, Timer, Zap, Fingerprint, Globe, CheckCircle2, Sparkles
    } from 'lucide-svelte';
    import ShareDrawer from '$lib/components/share-drawer.svelte';
	import ImageCarousel from '$lib/components/image-carousel.svelte';
    import AuthenticatedPhotosAlert from '$lib/components/authenticated-photos-alert.svelte';

	let { data } = $props();
	const { photo } = data;
    const metadata = photo.metadata || {};

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

	function safeParseManifest(rawManifest) {
		if (!rawManifest) return null;
		if (typeof rawManifest === 'object') return rawManifest;
		if (typeof rawManifest !== 'string') return null;
		try {
			return JSON.parse(rawManifest);
		} catch {
			return null;
		}
	}

	const c2paManifest = safeParseManifest(metadata.c2pa_manifest);
	const c2paProvenance = (() => {
		if (!c2paManifest) return null;
		try {
			return analyzeProvenance(normalizeManifestStore(c2paManifest));
		} catch (error) {
			console.error('Failed to analyze saved C2PA manifest', error);
			return null;
		}
	})();

	const c2paHistoryGroups = (() => {
		const actions = c2paProvenance?.actions || [];
		const groups = {};

		for (const action of actions) {
			const category = getActionCategory(action?.action);
			const key = category.label;
			if (!groups[key]) groups[key] = { category, actions: [], aiCount: 0 };
			groups[key].actions.push(action);
			if (isAiAction(action)) groups[key].aiCount += 1;
		}

		return Object.values(groups).sort((a, b) => a.category.order - b.category.order);
	})();

	const showC2paHistorySection = Boolean(
		metadata.c2pa_verified || c2paProvenance?.hasManifest || c2paHistoryGroups.length > 0
	);
	const c2paHistoryIsStrictVerified = metadata.c2pa_verified === true;
	const c2paHistoryHasSignedProof = c2paProvenance?.activeSignatureValidated === true;
	const c2paHistoryCardClass = c2paHistoryIsStrictVerified
		? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-transparent'
		: 'border-amber-200 dark:border-amber-800 bg-amber-50/60 dark:bg-transparent';
	const c2paHistoryIconClass = c2paHistoryIsStrictVerified
		? 'text-green-600 dark:text-green-500'
		: 'text-amber-600 dark:text-amber-500';

	function getC2paHistorySubtitle() {
		if (c2paHistoryIsStrictVerified) {
			return 'This photo is authentic and its history is securely tracked.';
		}
		if (c2paHistoryHasSignedProof && c2paProvenance?.signingCredentialTrusted === false) {
			return 'This photo has signed C2PA history, but the signer is not trusted in this viewer.';
		}
		if (c2paHistoryHasSignedProof) {
			return 'This photo has signed C2PA history available from the saved manifest.';
		}
		return 'This photo includes saved C2PA history from the uploaded manifest.';
	}

	// TODO: Replace with real data
	const photoDetails = {
		tags: ['Nature', 'Landscape', 'Photography'],
		likes: {
			users: [
				{ name: 'Alex', avatar: 'https://i.pravatar.cc/150?u=alex' },
				{ name: 'Sam', avatar: 'https://i.pravatar.cc/150?u=sam' }
			],
			count: 24
		}
	};

	// Array of 20 image URLs for the carousel
	const carouselImages = Array.from({ length: 20 }, (_, i) => `https://picsum.photos/400/400?random=${i + 1}`);

	// Helper function to get initials from a name
	function getInitials(name = '') {
		return name
			.trim()
			.split(/\s+/)
			.filter(Boolean)
			.map((word) => word[0]?.toUpperCase() || '')
			.join('');
	}

    function formatBytes(bytes, decimals = 2) {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    }

    function getPhotoUrl(photo) {
        if (photo.storage_key) {
            const { data: urlData } = data.supabase.storage
                .from('photos')
                .getPublicUrl(photo.storage_key);
            return urlData.publicUrl;
        }
        return photo.storage_url;
    }
</script>

<div class="container mx-auto my-6 px-4 md:px-6">
    <div class="mb-4">
        <a href="/{$page.params.username}" class="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-4">
            <ArrowLeft class="mr-2 h-4 w-4" />
            Back to Profile
        </a>
    </div>
    {#if photo}
        <div class="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
            <div class="flex-1 min-w-0">
                <img
                    src={getPhotoUrl(photo)}
                    alt={photo.title ?? `Photo by ${photo.user.display_name}`}
                    class="w-full rounded-lg"                    
                />
                <!-- Carousel below the main image on desktop only -->
                <div class="hidden lg:block mt-4">
                    <ImageCarousel images={carouselImages} />
                </div>
            </div>

            <!-- 
              CONTENT CONTAINER:
              - `w-full`: Makes the content take the full width on smaller screens.
              - `lg:w-[400px]`: Sets a fixed width of 400px for the content column on large screens (1024px) and up.
              - `flex-shrink-0`: Prevents this column from shrinking when space is tight.
            -->
            <div class="w-full lg:w-[400px] flex-shrink-0">
                <div class="grid gap-6">
                    <div>
                        <h1 class="text-3xl font-bold">{photo.user.display_name}</h1>
                        <div class="flex items-center gap-2">
                            <p class="text-slate-500 dark:text-slate-400">@{photo.user.username}</p>
                            <a
                                href="/{photo.user.username}"
                                class="text-blue-600 dark:text-blue-400 text-sm underline hover:text-blue-800"
                            >
                                View profile
                            </a>
                        </div>
                    </div>
                    
                    <div class="flex gap-2">
                        <ShareDrawer 
                            title={`photo by ${photo.user.display_name}`}
                            description={photo.description ?? 'Check out this amazing photo'}
                        />
                        <Button>
                            <Download class="h-4 w-4 mr-2" />
                            Download
                        </Button>
                    </div>

                    <Separator />

                    <!-- C2PA Verified Section -->
                    {#if showC2paHistorySection}
                        <div class={`grid gap-3 border rounded-lg p-4 ${c2paHistoryCardClass}`}>
                            <div class="flex items-start gap-3">
                                <CheckCircle2 class={`h-5 w-5 mt-0.5 flex-shrink-0 ${c2paHistoryIconClass}`} />
                                <div>
                                    <h3 class="font-semibold text-base leading-tight">
                                        {c2paHistoryIsStrictVerified ? 'C2PA Verified History' : 'C2PA Signed History'}
                                    </h3>
                                    <p class="text-sm text-slate-500 dark:text-slate-400">{getC2paHistorySubtitle()}</p>
                                </div>
                            </div>
                            <Accordion class="w-full" type="single" collapsible>
                                {#if c2paHistoryGroups.length > 0}
                                    {#each c2paHistoryGroups as group, index (group.category.label)}
                                        <AccordionItem value={`c2pa-history-${index}`}>
                                            <AccordionTrigger>
                                                <div class="flex w-full min-w-0 items-start gap-3">
                                                    <group.category.icon
                                                        class="h-5 w-5 text-slate-700 dark:text-slate-300 mt-0.5 shrink-0"
                                                    />
                                                    <div class="min-w-0 text-left">
                                                        <div class="flex flex-wrap items-center gap-2">
                                                            <span class="text-sm font-medium">{group.category.label}</span>
                                                            {#if group.aiCount > 0}
                                                                <span class="inline-flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                                                                    <Sparkles class="h-3 w-3" />
                                                                    {group.aiCount} AI-tagged
                                                                </span>
                                                            {/if}
                                                        </div>
                                                        <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                            {CATEGORY_EXPLANATIONS[group.category.label] || 'Recorded changes in this category.'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <ul class="space-y-3 pt-1">
                                                    {#each group.actions as action}
                                                        <li class="flex items-start gap-3 text-sm">
                                                            <span class="mt-2 h-1.5 w-1.5 rounded-full bg-green-600 dark:bg-green-500 shrink-0"></span>
                                                            <div class="min-w-0">
                                                                <p class="leading-snug">{formatActionLine(action)}</p>
                                                                {#if isAiAction(action) || getDigitalSourceTypeLabel(action)}
                                                                    <div class="mt-1 flex flex-wrap items-center gap-1.5">
                                                                        {#if isAiAction(action)}
                                                                            <span class="inline-flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                                                                                <Sparkles class="h-3 w-3" />
                                                                                AI-assisted
                                                                            </span>
                                                                        {/if}
                                                                        {#if getDigitalSourceTypeLabel(action)}
                                                                            <span class="inline-flex items-center rounded-full bg-slate-200/80 dark:bg-slate-800 px-2 py-0.5 text-[10px] text-slate-600 dark:text-slate-300">
                                                                                {getDigitalSourceTypeLabel(action)}
                                                                            </span>
                                                                        {/if}
                                                                    </div>
                                                                {/if}
                                                                <p class="mt-1 break-all text-[11px] text-slate-500 dark:text-slate-400">
                                                                    Recorded action: {action.action}
                                                                </p>
                                                            </div>
                                                        </li>
                                                    {/each}
                                                </ul>
                                            </AccordionContent>
                                        </AccordionItem>
                                    {/each}
                                {:else}
                                    <div class="rounded-md border border-green-200/70 dark:border-green-900 px-3 py-2 text-sm text-slate-600 dark:text-slate-300">
                                        No specific edit actions were listed in the saved C2PA history.
                                    </div>
                                {/if}
                            </Accordion>
                        </div>
                    {/if}

                    <div class="grid gap-2">
                        <h3 class="font-semibold">Tags</h3>
                        <div class="flex flex-wrap gap-2">
                            {#each photoDetails.tags as tag}
                                <Badge variant="secondary">{tag}</Badge>
                            {/each}
                            {#if photoDetails.tags.length === 0}
                                <p class="text-sm text-slate-500">No tags.</p>
                            {/if}
                        </div>
                    </div>

                    <Separator />

                    <Tabs value="details" class="w-full">
                        <TabsList>
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="exif">Technical</TabsTrigger>
                        </TabsList>
                        <TabsContent value="details" class="mt-4">
                            <div class="grid grid-cols-[auto_1fr] gap-y-3 gap-x-4 text-sm items-center">
                                <div class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                    <Calendar class="w-4 h-4" /> Uploaded
                                </div>
                                <div>{new Date(photo.created_at).toLocaleDateString()}</div>
                                
                                <div class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                    <Maximize class="w-4 h-4" /> Dimensions
                                </div>
                                <div>{photo.width} x {photo.height}</div>

                                <div class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                    <HardDrive class="w-4 h-4" /> File Size
                                </div>
                                <div>{formatBytes(metadata.file_size)}</div>

                                <div class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                    <FileImage class="w-4 h-4" /> Type
                                </div>
                                <div>{metadata.mime_type?.split('/')[1]?.toUpperCase() || 'Unknown'}</div>

                                {#if metadata.location_visibility === 'public' && (metadata.location_name || (metadata.gps_lat && metadata.gps_lng))}
                                    <div class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                        <MapPin class="w-4 h-4" /> Location
                                    </div>
                                    <div>{metadata.location_name || `${metadata.gps_lat.toFixed(4)}, ${metadata.gps_lng.toFixed(4)}`}</div>
                                {/if}
                            </div>
                        </TabsContent>
                        <TabsContent value="exif" class="mt-4">
                            <div class="grid grid-cols-[auto_1fr] gap-y-3 gap-x-4 text-sm items-center">
                                <div class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                    <Camera class="w-4 h-4" /> Camera
                                </div>
                                <div>{metadata.camera || 'Unknown'}</div>
                                
                                <div class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                    <Aperture class="w-4 h-4" /> Lens
                                </div>
                                <div>{metadata.lens || 'Unknown'}</div>

                                <div class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                    <Focus class="w-4 h-4" /> Focal Length
                                </div>
                                <div>{metadata.focal_length || 'N/A'}</div>

                                <div class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                    <Aperture class="w-4 h-4" /> Aperture
                                </div>
                                <div>{metadata.aperture || 'N/A'}</div>

                                <div class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                    <Timer class="w-4 h-4" /> Shutter
                                </div>
                                <div>{metadata.shutter_speed || 'N/A'}</div>

                                <div class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                    <Zap class="w-4 h-4" /> ISO
                                </div>
                                <div>{metadata.iso || 'N/A'}</div>
                                
                                <div class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                    <Globe class="w-4 h-4" /> Color Space
                                </div>
                                <div>{metadata.color_space || 'N/A'}</div>

                                {#if metadata.sha256}
                                    <div class="flex items-center gap-2 text-slate-500 dark:text-slate-400" title="SHA-256 Hash">
                                        <Fingerprint class="w-4 h-4" /> Hash
                                    </div>
                                    <div class="truncate w-32" title={metadata.sha256}>{metadata.sha256.substring(0, 12)}...</div>
                                {/if}
                            </div>
                        </TabsContent>
                    </Tabs>


                    <Separator />

                    <div class="flex items-center gap-4">
                        <div class="flex -space-x-2">
                            {#each photoDetails.likes.users as user, i}
                                {#if i < 2}
                                    <Avatar class="border-2 border-background">
                                        <AvatarImage src={user.avatar} alt={user.name} />
                                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                    </Avatar>
                                {/if}
                            {/each}
                        </div>
                        <div class="text-sm text-slate-500 dark:text-slate-400">
                            {#if photoDetails.likes.count > 0}
                                Liked by <strong>{photoDetails.likes.users[0]?.name}</strong> and
                                <strong>{photoDetails.likes.count - 1} others</strong>
                            {:else}
                                Be the first to like this photo
                            {/if}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Carousel at the bottom on mobile only -->
        <div class="block lg:hidden mt-8">
            <ImageCarousel images={carouselImages} />
        </div>
    {:else}
        <div class="text-center">
            <h1 class="text-2xl font-bold">Photo not found</h1>
            <p class="text-muted-foreground">The requested photo could not be found.</p>
        </div>
    {/if}
</div>
