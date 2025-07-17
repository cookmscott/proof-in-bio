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
    import { Download, Camera, Paintbrush, Crop, SlidersHorizontal, Eraser } from 'lucide-svelte';
    import ShareDrawer from '$lib/components/share-drawer.svelte';
    import ImageCarousel from '$lib/components/image-carousel.svelte';

    // Map icon names to Svelte components
    const iconComponents = {
        camera: Camera,
        edit: Paintbrush,
        crop: Crop,
        adjust: SlidersHorizontal,
        heal: Eraser
    };

    // The JSON data is now directly included in the component.
    const photoData = {
        '33': {
            id: '33',
            photographer: {
                name: 'Sofia Davis',
                username: '@sofiadavis',
                avatar: 'https://i.pravatar.cc/256?img=23'
            },
            imageUrl: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?q=80&w=2070&auto=format&fit=crop',
            details: {
                uploaded: 'June 25, 2024',
                dimensions: '6016 x 4016',
                focalLength: '50.0mm',
                aperture: 'ƒ/2.8',
                shutterSpeed: '1/250s',
                iso: '400',
                camera: 'Canon EOS R5'
            },
            tags: ['dog', 'pet', 'animal', 'portrait', 'cute'],
            likes: {
                count: 25,
                users: [
                    {
                        name: 'Adam',
                        avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d'
                    },
                    {
                        name: 'Bella',
                        avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704e'
                    }
                ]
            },
            history: [
                {
                    id: 3,
                    title: 'Image Cropped',
                    date: 'Jan 9, 2024 7:00PM',
                    icon: 'crop'
                },
                {
                    id: 2,
                    title: 'Adjustments in Lightroom',
                    date: 'Jan 3, 2024 5:00PM',
                    icon: 'adjust'
                },
                {
                    id: 1,
                    title: 'Original image taken',
                    date: 'Jan 1, 2024 5:00PM',
                    icon: 'camera'
                }
            ]
        }
    };

    // We'll just grab the photo data for ID '33' for this example.
    const photo = photoData['33'];

    // Array of 20 image URLs for the carousel
    const carouselImages = Array.from({ length: 20 }, (_, i) => `https://picsum.photos/400/400?random=${i + 1}`);

    // Helper function to get initials from a name
    function getInitials(name = '') {
        return name
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .map(word => word[0]?.toUpperCase() || '')
            .join('');
    }
</script>

<div class="container mx-auto my-12 px-4 md:px-6">
    {#if photo}
        <div class="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
            <div class="flex-1 min-w-0">
                <img
                    src={photo.imageUrl}
                    alt="Photo by {photo.photographer.name}"
                    class="w-full"                    
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
                        <h1 class="text-3xl font-bold">{photo.photographer.name}</h1>
                        <p class="text-muted-foreground">{photo.photographer.username}</p>
                    </div>
                    <div class="flex gap-2">
                        <ShareDrawer 
                            title={photo.photographer.name}
                            description="Check out this amazing photo"
                        />
                        <Button>
                            <Download class="h-4 w-4 mr-2" />
                            Download
                        </Button>
                    </div>

                    <Separator />

                    <div class="grid gap-2">
                        <h3 class="font-semibold">History</h3>
                        <Accordion class="w-full" type="single" collapsible>
                            {#each photo.history as item (item.id)}
                                <AccordionItem value="item-{item.id}">
                                    <AccordionTrigger>
                                        <div class="flex items-center w-full gap-3">
                                            <svelte:component
                                                this={iconComponents[item.icon]}
                                                class="h-5 w-5 text-muted-foreground"
                                            />
                                            <span>{item.title}</span>
                                            <div class="flex-grow"></div>
                                            <span class="text-xs text-muted-foreground font-normal">{item.date}</span>
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
                            {#each photo.tags as tag}
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
                                <div class="text-muted-foreground">Uploaded</div>
                                <div>{photo.details.uploaded}</div>
                                <div class="text-muted-foreground">Dimensions</div>
                                <div>{photo.details.dimensions}</div>
                                <div class="text-muted-foreground">Focal Length</div>
                                <div>{photo.details.focalLength}</div>
                                <div class="text-muted-foreground">Aperture</div>
                                <div>{photo.details.aperture}</div>
                                <div class="text-muted-foreground">Shutter Speed</div>
                                <div>{photo.details.shutterSpeed}</div>
                                <div class="text-muted-foreground">ISO</div>
                                <div>{photo.details.iso}</div>
                                <div class="text-muted-foreground">Camera</div>
                                <div>{photo.details.camera}</div>
                            </div>
                        </TabsContent>
                        <TabsContent value="exif" class="mt-4">
                            <p class="text-sm text-muted-foreground">EXIF data would be displayed here.</p>
                        </TabsContent>
                    </Tabs>


                    <Separator />

                    <div class="flex items-center gap-4">
                        <div class="flex -space-x-2">
                            {#each photo.likes.users as user, i}
                                {#if i < 2}
                                    <Avatar class="border-2 border-background">
                                        <AvatarImage src={user.avatar} alt={user.name} />
                                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                    </Avatar>
                                {/if}
                            {/each}
                        </div>
                        <div class="text-sm text-muted-foreground">
                            Liked by <strong>{photo.likes.users[0].name}</strong> and
                            <strong>{photo.likes.count - 1} others</strong>
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