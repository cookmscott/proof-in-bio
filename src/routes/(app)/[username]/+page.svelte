<script>
    import { CheckCircle, Share2, Plus, User } from 'lucide-svelte';
    import { Avatar, AvatarFallback, AvatarImage } from '$lib/ui/avatar';
    import { Button } from '$lib/ui/button';
    import { Badge } from '$lib/ui/badge';
    import { Alert, AlertDescription, AlertTitle } from '$lib/ui/alert';
    import { Card } from '$lib/ui/card';
    import { AspectRatio } from '$lib/ui/aspect-ratio';

    // This is a Svelte 5 rune, which is a new feature.
    // In a real app, this data would likely come from a load function.
    let { data } = $props();

    // --- Placeholder Data ---
    // In a real app, this would come from your backend, loaded in +page.ts
    const userProfile = {
        username: 'janedoe',
        name: 'Jane Doe',
        description: 'Capturing moments, one click at a time. Lover of landscapes and candid portraits.',
        interests: ['Photography', 'Travel', 'Nature', 'Art'],
        avatarUrl: 'https://i.pravatar.cc/256?img=23'
    };

    const photos = Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        url: `https://picsum.photos/600/600?random=${i}`,
        alt: `Portfolio image ${i + 1}`
    }));
    // --- End Placeholder Data ---
</script>

<!-- Main wrapper for the entire page -->
<div class="bg-background text-foreground min-h-screen">
    <!-- 
      This relative container establishes a stacking context.
      The absolute background will be positioned relative to this,
      and the main content will stack on top.
    -->
    <div class="relative">
        <!-- Hero Background -->
        <!-- This is now positioned absolutely to the full-width parent, ensuring it spans the screen -->
        <div class="absolute top-0 left-0 h-[400px] w-full hidden dark:block">
            <img
                src="https://picsum.photos/1600/900?random=hero"
                alt="Profile hero background"
                class="hero-background-image h-full w-full object-cover"
            />
            <div
                class="absolute inset-0 bg-gradient-to-t from-background via-background/70 via-background/30 to-transparent"
            ></div>
        </div>

        <!-- 
          Main content container. 
          'relative' and 'z-10' ensure it stacks on top of the absolute background.
          'container', 'mx-auto', and 'max-w-screen-lg' center and constrain the content.
        -->
        <main class="relative z-10 container mx-auto max-w-screen-lg px-4 py-8">
            <!-- Profile Header Section -->
            <div class="relative z-10 mb-8 flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
                <Avatar class="h-24 w-24 md:h-32 md:w-32">
                    <AvatarImage src={userProfile.avatarUrl} alt={userProfile.name} />
                    <AvatarFallback>
                        <User class="h-12 w-12" />
                    </AvatarFallback>
                </Avatar>

                <div class="flex-grow">
                    <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">{userProfile.name}</h1>
                    <p class="text-muted-foreground">@{userProfile.username}</p>
                    <p class="mt-2 max-w-xl text-balance">{userProfile.description}</p>
                    <div class="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
                        {#each userProfile.interests as interest}
                            <Badge variant="secondary">{interest}</Badge>
                        {/each}
                    </div>
                </div>

                <div class="mt-4 flex gap-2 md:mt-0 md:absolute md:top-0 md:right-0">
                    <Button variant="secondary">
                        <Share2 class="mr-2 h-4 w-4" />
                        Share Profile
                    </Button>
                    <Button>Edit Profile</Button>
                </div>
            </div>

            <!-- Authenticated Photos Alert -->     
            <div class="relative backdrop-blur-md bg-white/10 flex w-full items-center rounded-lg border border-gray/60 py-3 px-4 mb-8">
                <CheckCircle class="h-5 w-5 mt-1 shrink-0" />                         
                <div class="ml-4 flex-grow">
                    <h5 class="font-semibold text-sm">Made by Humans.</h5>
                    <div class="text-xs sm:text-sm">
                        No heavy editing or AI generation is allowed on this platform. What you see is what was captured.
                    </div>
                </div>        
                <Button variant="ghost" size="sm" class="ml-4 shrink-0 text-xs sm:text-sm px-4 py-6">
                    Learn More
                </Button>
            </div>
            
            <!-- Photo Gallery Section -->
            <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-4">
                {#each photos as photo (photo.id)}
                    <a href={`/photo/${photo.id}`} class="group">
                        <Card class="overflow-hidden border-0 transition-all rounded-sm py-0 duration-200 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1">
                            <AspectRatio ratio={1}>
                                <img
                                    src={photo.url}
                                    alt={photo.alt}
                                    class="h-full w-full object-cover"
                                />
                            </AspectRatio>
                        </Card>
                    </a>
                {/each}
            </div>
        </main>
    </div>

    <!-- Fixed "Add Images" Button -->
    <Button class="group fixed bottom-6 right-6 h-14 min-w-[3.5rem] rounded-full shadow-2xl transition-all duration-300 ease-out hover:pr-6 hover:pl-4 flex items-center justify-center overflow-hidden">
        <span class="flex items-center">
            <Plus class="h-10 w-10 transition-[margin] duration-300 ease-out group-hover:mr-2" />
            <span class="max-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 ease-out group-hover:max-w-[6rem]">
            Add Images
            </span>
        </span>
        <span class="sr-only">Add Images</span>
    </Button>
</div>
