<script>
    import { Input } from "$lib/ui/input";
    import * as Avatar from "$lib/ui/avatar";
    import { Search, Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from "lucide-svelte";
    
    let { data } = $props();
    let searchQuery = $state("");

    const dateFormatter = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });

    const getDateGrouping = (createdAt) => {
        if (!createdAt) {
            return { key: "unknown", label: "Unknown date", value: -1 };
        }

        const date = new Date(createdAt);
        if (Number.isNaN(date.getTime())) {
            return { key: "unknown", label: "Unknown date", value: -1 };
        }

        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        const value = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

        return { key, label: dateFormatter.format(date), value };
    };

    const hashString = (input) => {
        let hash = 0;
        for (let i = 0; i < input.length; i += 1) {
            hash = (hash << 5) - hash + input.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash);
    };

    const seededCount = (seed, min, max) => {
        const range = max - min + 1;
        return min + (seed % range);
    };

    // Calculate aggregated stats for a post based on its unique key
    const getPostStats = (postKey, photos) => {
        const seed = hashString(postKey);
        
        let realLikes = 0;
        let hasRealStats = false;
        
        for (const photo of photos) {
            if (Number.isFinite(photo.like_count) && photo.like_count > 0) {
                realLikes += photo.like_count;
                hasRealStats = true;
            }
        }

        return {
            likes: hasRealStats ? realLikes : seededCount(seed, 12, 850),
            comments: seededCount(seed * 2, 0, 85)
        };
    };

    let feed = $derived.by(() => {
        const query = searchQuery.toLowerCase().trim();
        const postsMap = new Map();

        // 1. Flatten and filter all photos
        for (const user of data.users ?? []) {
            if (query && !user.username?.toLowerCase().includes(query)) {
                continue;
            }

            if (user.photos) {
                for (const photo of user.photos) {
                    const { key: dateKey, label: dateLabel, value: dateValue } = getDateGrouping(photo.created_at);
                    
                    // Grouping photos by user AND date to form a "Post"
                    const postKey = `${user.username}-${dateKey}`;
                    
                    if (!postsMap.has(postKey)) {
                        postsMap.set(postKey, {
                            id: postKey,
                            user: user,
                            dateLabel,
                            timestamp: dateValue,
                            photos: []
                        });
                    }
                    postsMap.get(postKey).photos.push(photo);
                }
            }
        }

        // 2. Convert map to array and sort by most recent
        return Array.from(postsMap.values())
            .sort((a, b) => b.timestamp - a.timestamp)
            .map(post => ({
                ...post,
                stats: getPostStats(post.id, post.photos)
            }));
    });
</script>

<div class="container py-8 max-w-2xl mx-auto space-y-8 px-4 sm:px-6">
    <!-- Search Section -->
    <div class="relative max-w-md mx-auto mb-10">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
            placeholder="Search users..." 
            class="pl-9 bg-background border-input rounded-full" 
            bind:value={searchQuery}
        />
    </div>

    <!-- Feed -->
    <div class="space-y-8">
        {#if feed.length === 0}
            <div class="text-center py-16 text-muted-foreground border rounded-2xl bg-card border-dashed">
                <p>No photos found.</p>
            </div>
        {/if}

        {#each feed as post (post.id)}
            <article class="bg-card text-card-foreground border rounded-2xl overflow-hidden shadow-sm">
                <!-- Post Header -->
                <div class="flex items-center justify-between p-4">
                    <div class="flex items-center gap-3">
                        <a href="/{post.user.username}">
                            <Avatar.Root class="h-10 w-10 border border-border transition-opacity hover:opacity-80">
                                {#if post.user.avatar_url}
                                    <Avatar.Image src={post.user.avatar_url} alt={post.user.username} />
                                {/if}
                                <Avatar.Fallback class="bg-primary/5">{post.user.username?.slice(0, 2).toUpperCase() || 'U'}</Avatar.Fallback>
                            </Avatar.Root>
                        </a>
                        <div class="flex flex-col leading-tight">
                            <a href="/{post.user.username}" class="font-semibold text-sm hover:underline decoration-primary underline-offset-2">
                                {post.user.username}
                            </a>
                            <span class="text-xs text-muted-foreground mt-0.5">
                                {post.dateLabel}
                            </span>
                        </div>
                    </div>
                    <button class="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted">
                        <MoreHorizontal class="h-5 w-5" />
                    </button>
                </div>

                <!-- Post Content (Photo Grid) -->
                <div class="w-full bg-muted/30 border-y">
                    {#if post.photos.length === 1}
                        <a href="/{post.user.username}/{post.photos[0].id}" class="block group overflow-hidden">
                            <img 
                                src={post.photos[0].storage_url} 
                                alt="" 
                                class="w-full h-auto max-h-[600px] object-cover transition-transform duration-500 group-hover:scale-[1.02]" 
                                loading="lazy" 
                            />
                        </a>
                    
                    {:else if post.photos.length === 2}
                        <div class="grid grid-cols-2 gap-0.5">
                            {#each post.photos.slice(0, 2) as photo}
                                <a href="/{post.user.username}/{photo.id}" class="block aspect-square overflow-hidden group">
                                    <img src={photo.storage_url} alt="" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]" loading="lazy" />
                                </a>
                            {/each}
                        </div>
                    
                    {:else if post.photos.length === 3}
                        <div class="grid grid-cols-2 gap-0.5 h-[400px] sm:h-[500px]">
                            <a href="/{post.user.username}/{post.photos[0].id}" class="block h-full overflow-hidden group">
                                <img src={post.photos[0].storage_url} alt="" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]" loading="lazy" />
                            </a>
                            <div class="grid grid-rows-2 gap-0.5 h-full">
                                {#each post.photos.slice(1, 3) as photo}
                                    <a href="/{post.user.username}/{photo.id}" class="block h-full overflow-hidden group">
                                        <img src={photo.storage_url} alt="" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]" loading="lazy" />
                                    </a>
                                {/each}
                            </div>
                        </div>
                    
                    {:else}
                        <div class="grid grid-cols-2 grid-rows-2 gap-0.5 aspect-square">
                            {#each post.photos.slice(0, 3) as photo}
                                <a href="/{post.user.username}/{photo.id}" class="block overflow-hidden group h-full">
                                    <img src={photo.storage_url} alt="" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]" loading="lazy" />
                                </a>
                            {/each}
                            
                            <!-- 4th Item with potential "5+" overlay -->
                            <a href="/{post.user.username}/{post.photos[3].id}" class="block relative overflow-hidden group h-full">
                                <img src={post.photos[3].storage_url} alt="" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]" loading="lazy" />
                                
                                {#if post.photos.length > 4}
                                    <div class="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center transition-colors group-hover:bg-black/60">
                                        <span class="text-white text-3xl font-medium tracking-tight">+{post.photos.length - 3}</span>
                                    </div>
                                {/if}
                            </a>
                        </div>
                    {/if}
                </div>

                <!-- Post Actions & Footer -->
                <div class="p-4 space-y-3">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <button class="hover:text-muted-foreground transition-colors group">
                                <Heart class="h-6 w-6 group-hover:fill-current group-hover:text-red-500 transition-all" />
                            </button>
                            <button class="hover:text-muted-foreground transition-colors">
                                <MessageCircle class="h-6 w-6" />
                            </button>
                            <button class="hover:text-muted-foreground transition-colors">
                                <Share2 class="h-6 w-6" />
                            </button>
                        </div>
                        <button class="hover:text-muted-foreground transition-colors">
                            <Bookmark class="h-6 w-6" />
                        </button>
                    </div>

                    <div class="flex flex-col gap-1">
                        <span class="font-semibold text-sm">
                            {post.stats.likes.toLocaleString()} likes
                        </span>
                        
                        {#if post.photos.length > 1}
                            <div class="text-sm">
                                <span class="font-semibold">{post.user.username}</span> 
                                <span class="text-foreground/90">added a collection of {post.photos.length} photos.</span>
                            </div>
                        {/if}
                        
                        {#if post.stats.comments > 0}
                            <button class="text-sm text-muted-foreground text-left mt-1 hover:underline">
                                View all {post.stats.comments} comments
                            </button>
                        {/if}
                    </div>
                </div>
            </article>
        {/each}
    </div>
</div>