<script>
	import { Button } from '$lib/ui/button';
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
    import { Download, Camera, Paintbrush, Crop, SlidersHorizontal, Eraser, CheckCircle2 } from 'lucide-svelte';
    import ShareDrawer from '$lib/components/share-drawer.svelte';
	import ImageCarousel from '$lib/components/image-carousel.svelte';

	let { data } = $props();
	const { photo } = data;

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
		history: [],
		tags: [],
		likes: { users: [], count: 0 }
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
</script>

<div class="container mx-auto my-12 px-4 md:px-6">
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
                            title={photo.user.display_name}
                            description={photo.description ?? 'Check out this amazing photo'}
                        />
                        <Button>
                            <Download class="h-4 w-4 mr-2" />
                            Download
                        </Button>
                    </div>

                    <Separator />

                    <!-- Refined History Section with Dark Mode -->
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
                                        Details about the "{item.title}" edit can be displayed here.
                                    </AccordionContent>
                                </AccordionItem>
                            {/each}
                        </Accordion>
                    </div>
                    
                    <Separator />

                    <div class="grid gap-2">
                        <h3 class="font-semibold">Tags</h3>
                        <div class="flex flex-wrap gap-2">
                            {#each photoDetails.tags as tag}
                                <Badge variant="secondary">{tag}</Badge>
                            {/each}
                        </div>
                    </div>

                    <Separator />

                    <Tabs value="details" class="w-full">
                        <TabsList>
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="exif">Exif</TabsTrigger>
                        </TabsList>
                        <TabsContent value="details" class="mt-4">
                            <div class="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                                <div class="text-slate-500 dark:text-slate-400">Uploaded</div>
                                <div>{new Date(photo.created_at).toLocaleDateString()}</div>
                                <div class="text-slate-500 dark:text-slate-400">Dimensions</div>
                                <div>{photo.width} x {photo.height}</div>
                                <div class="text-slate-500 dark:text-slate-400">Focal Length</div>
                                <div>{photo.focal_length}</div>
                                <div class="text-slate-500 dark:text-slate-400">Aperture</div>
                                <div>{photo.aperture}</div>
                                <div class="text-slate-500 dark:text-slate-400">Shutter Speed</div>
                                <div>{photo.shutter_speed}</div>
                                <div class="text-slate-500 dark:text-slate-400">ISO</div>
                                <div>{photo.iso}</div>
                                <div class="text-slate-500 dark:text-slate-400">Camera</div>
                                <div>{photo.camera_make} {photo.camera_model}</div>
                            </div>
                        </TabsContent>
                        <TabsContent value="exif" class="mt-4">
                            <p class="text-sm text-slate-500 dark:text-slate-400">EXIF data would be displayed here.</p>
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
