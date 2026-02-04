<script>
    import { Input } from "$lib/ui/input";
    import * as Carousel from "$lib/ui/carousel";
    import * as Avatar from "$lib/ui/avatar";
    import { Search, Heart, Eye } from "lucide-svelte";
    
    let { data } = $props();
    let searchQuery = $state("");
</script>

<div class="container py-8 max-w-7xl mx-auto space-y-8 px-4 md:px-6">
    <!-- Search Section -->
    <div class="relative max-w-md mx-auto mb-12">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
            placeholder="Search users..." 
            class="pl-9 bg-background border-input" 
            bind:value={searchQuery}
        />
    </div>

    <!-- Feed -->
    <div class="space-y-16">
        {#each data.users as user}
            <div class="space-y-4">
                <!-- User Header -->
                <div class="flex items-center gap-3">
                    <Avatar.Root class="h-10 w-10 border border-border">
                        {#if user.avatar_url}
                            <Avatar.Image src={user.avatar_url} alt={user.username} />
                        {/if}
                        <Avatar.Fallback>{user.username?.slice(0, 2).toUpperCase() || 'U'}</Avatar.Fallback>
                    </Avatar.Root>
                    <a href="/{user.username}" class="group">
                        <h3 class="font-semibold text-lg leading-none group-hover:underline decoration-primary underline-offset-4">{user.username}</h3>
                        <p class="text-xs text-muted-foreground mt-1">
                            {user.photos?.length || 0} photos
                        </p>
                    </a>
                </div>

                <!-- Photos Carousel -->
                <div class="relative">
                     <Carousel.Root opts={{ align: "start", loop: false }} class="w-full">
                        <Carousel.Content class="-ml-4">
                            {#each user.photos as photo}
                                <Carousel.Item class="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                                    <div class="group relative aspect-[4/5] overflow-hidden rounded-lg border bg-muted">
                                        <img 
                                            src={photo.storage_url} 
                                            alt="" 
                                            class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                        <!-- Overlay Gradient -->
                                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        
                                        <!-- Stats (only visible on hover/focus) -->
                                                                                    <div class="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                                                                                    <div class="flex items-center gap-1.5 backdrop-blur-sm bg-black/30 px-2 py-1 rounded-full">
                                                                                        <Heart class="h-3.5 w-3.5 fill-current" />
                                                                                        <span class="font-medium">{photo.like_count ?? 0}</span>
                                                                                    </div>
                                                                                    <div class="flex items-center gap-1.5 backdrop-blur-sm bg-black/30 px-2 py-1 rounded-full">
                                                                                        <Eye class="h-3.5 w-3.5" />
                                                                                        <span class="font-medium">{photo.view_count ?? 0}</span>
                                                                                    </div>
                                                                                </div>                                    </div>
                                </Carousel.Item>
                            {/each}
                        </Carousel.Content>
                        <Carousel.Previous class="left-2 hidden md:flex" />
                        <Carousel.Next class="right-2 hidden md:flex" />
                    </Carousel.Root>
                </div>
            </div>
        {/each}
    </div>
</div>
