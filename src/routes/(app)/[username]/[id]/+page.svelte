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
	import { Root as Avatar, Image as AvatarImage, Fallback as AvatarFallback } from '$lib/ui/avatar';
	import { normalizeManifestStore, analyzeProvenance, getSimpleC2paStatus } from '$lib/c2pa';
	import {
		Download,
		Camera,
		ArrowLeft,
		MapPin,
		Calendar,
		HardDrive,
		FileImage,
		Aperture,
		Maximize,
		Focus,
		Timer,
		Zap,
		Fingerprint,
		Globe,
		CheckCircle2,
		Sparkles,
		Paintbrush
	} from 'lucide-svelte';
	import ShareDrawer from '$lib/components/share-drawer.svelte';
	import ImageCarousel from '$lib/components/image-carousel.svelte';

	let { data } = $props();
	const { photo } = data;
	const metadata = photo.metadata || {};

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

	const showC2paHistorySection = Boolean(metadata.c2pa_verified || c2paProvenance?.hasManifest);
	const c2paSimpleStatus = getSimpleC2paStatus(c2paProvenance);
	const c2paHasSimpleMatch =
		c2paSimpleStatus.confirmedCapture ||
		c2paSimpleStatus.editedWithNonAi ||
		c2paSimpleStatus.editedWithAi;
	const c2paHistoryCardClass = c2paHasSimpleMatch
		? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-transparent'
		: 'border-amber-200 dark:border-amber-800 bg-amber-50/60 dark:bg-transparent';
	const c2paHistoryIconClass = c2paHasSimpleMatch
		? 'text-green-600 dark:text-green-500'
		: 'text-amber-600 dark:text-amber-500';

	function getC2paHistorySubtitle() {
		if (c2paHasSimpleMatch) return 'Verified C2PA history found for this photo.';
		return 'No matching verified C2PA status was found.';
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
	const carouselImages = Array.from(
		{ length: 20 },
		(_, i) => `https://picsum.photos/400/400?random=${i + 1}`
	);

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
		return photo.image_url || photo.storage_url;
	}
</script>

<div class="container mx-auto my-6 px-4 md:px-6">
	<div class="mb-4">
		<Button variant="ghost" href="/{$page.params.username}" class="mb-4">
			<ArrowLeft class="mr-2 h-4 w-4" />
			Back to Profile
		</Button>
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
									<h3 class="font-semibold text-base leading-tight">C2PA Verification</h3>
									<p class="text-sm text-slate-500 dark:text-slate-400">
										{getC2paHistorySubtitle()}
									</p>
								</div>
							</div>
							<div class="text-sm">
								<ul class="space-y-2">
									<li
										class={`flex items-center gap-2 ${c2paSimpleStatus.confirmedCapture ? 'text-green-700 dark:text-green-400 font-medium' : 'text-slate-500 dark:text-slate-400 opacity-60'}`}
									>
										<Camera class="h-4 w-4 shrink-0" />
										<span>Media captured with camera</span>
									</li>
									<li
										class={`flex items-center gap-2 ${c2paSimpleStatus.editedWithNonAi ? 'text-blue-700 dark:text-blue-400 font-medium' : 'text-slate-500 dark:text-slate-400 opacity-60'}`}
									>
										<Paintbrush class="h-4 w-4 shrink-0" />
										<span>Edited with non-AI tools</span>
									</li>
									<li
										class={`flex items-center gap-2 ${c2paSimpleStatus.editedWithAi ? 'text-amber-700 dark:text-amber-400 font-medium' : 'text-slate-500 dark:text-slate-400 opacity-60'}`}
									>
										<Sparkles class="h-4 w-4 shrink-0" />
										<span>Edited with AI</span>
									</li>
								</ul>
							</div>
						</div>
					{/if}

					<div class="grid gap-2">
						<h3 class="font-semibold">Tags</h3>
						<div class="flex flex-wrap gap-2">
							{#each photoDetails.tags as tag (tag)}
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
									<div>
										{metadata.location_name ||
											`${metadata.gps_lat.toFixed(4)}, ${metadata.gps_lng.toFixed(4)}`}
									</div>
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
									<div
										class="flex items-center gap-2 text-slate-500 dark:text-slate-400"
										title="SHA-256 Hash"
									>
										<Fingerprint class="w-4 h-4" /> Hash
									</div>
									<div class="truncate w-32" title={metadata.sha256}>
										{metadata.sha256.substring(0, 12)}...
									</div>
								{/if}
							</div>
						</TabsContent>
					</Tabs>

					<Separator />

					<div class="flex items-center gap-4">
						<div class="flex -space-x-2">
							{#each photoDetails.likes.users as user, i (user.name)}
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
