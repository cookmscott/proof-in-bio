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
        Download, Camera, Paintbrush, Crop, SlidersHorizontal, Eraser, ArrowLeft,
        MapPin, Calendar, HardDrive, FileImage, Aperture, Maximize, Focus, Timer, Zap, Fingerprint, Globe, CheckCircle2
    } from 'lucide-svelte';
    import ShareDrawer from '$lib/components/share-drawer.svelte';
	import ImageCarousel from '$lib/components/image-carousel.svelte';
    import AuthenticatedPhotosAlert from '$lib/components/authenticated-photos-alert.svelte';

	let { data } = $props();
	const { photo } = data;
    const metadata = photo.metadata || {};

	// Map icon names to Svelte components
	const iconComponents = {
		camera: Camera,
		edit: Paintbrush,
		crop: Crop,
		adjust: SlidersHorizontal,
		heal: Eraser
	};

	// TODO: Replace with real data
	const photoDetails = {
		history: [
			{
				id: 1,
				title: 'Original Capture',
				date: 'Oct 24, 2023',
				icon: 'camera',
				description: 'Original photo captured with Sony A7R IV.'
			},
			{
				id: 2,
				title: 'Color Adjustment',
				date: 'Oct 25, 2023',
				icon: 'adjust',
				description: 'Applied color grading and exposure correction.'
			},
			{
				id: 3,
				title: 'Crop',
				date: 'Oct 25, 2023',
				icon: 'crop',
				description: 'Cropped to 16:9 aspect ratio.'
			}
		],
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
                    src={photo.storage_url}
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
                    {#if metadata.c2pa_verified}
                        <div class="grid gap-3 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-transparent rounded-lg p-4">
                            <div class="flex items-start gap-3">
                                <CheckCircle2 class="h-5 w-5 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h3 class="font-semibold text-base leading-tight">C2PA Verified History</h3>
                                    <p class="text-sm text-slate-500 dark:text-slate-400">This photo is authentic and its history is securely tracked.</p>
                                </div>
                            </div>
                            <Accordion class="w-full" type="single" collapsible>
                                {#each photoDetails.history as item (item.id)}
                                    <AccordionItem value="item-{item.id}">
                                        <AccordionTrigger>
                                            <div class="flex items-center w-full gap-3">
                                                <svelte:component
                                                    this={iconComponents[item.icon]}
                                                    class="h-5 w-5 text-slate-700 dark:text-slate-600"
                                                />
                                                <span class="text-sm">{item.title}</span>
                                                <div class="flex-grow"></div>
                                                <span class="text-xs text-slate-500 dark:text-slate-400 font-normal">{item.date}</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            {item.description}
                                        </AccordionContent>
                                    </AccordionItem>
                                {/each}
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
