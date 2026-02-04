<script>
    import { Input } from "$lib/ui/input";
    import * as Carousel from "$lib/ui/carousel";
    import * as Avatar from "$lib/ui/avatar";
    import { Search, Heart, Eye } from "lucide-svelte";
    
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

    let feed = $derived.by(() => {
        const allPhotos = [];
        const query = searchQuery.toLowerCase().trim();

        // 1. Flatten all photos with user reference
        for (const user of data.users ?? []) {
            // Filter users by search query if present
            if (query && !user.username?.toLowerCase().includes(query)) {
                continue;
            }

            if (user.photos) {
                for (const photo of user.photos) {
                    allPhotos.push({ ...photo, user });
                }
            }
        }

        // 2. Group by Date
        const dateGroups = new Map();
        for (const photo of allPhotos) {
            const { key, label, value } = getDateGrouping(photo.created_at);
            
            if (!dateGroups.has(key)) {
                dateGroups.set(key, {
                    key,
                    label,
                    value,
                    items: []
                });
            }
            dateGroups.get(key).items.push(photo);
        }

        // 3. Sort dates descending
        const sortedDates = Array.from(dateGroups.values())
            .sort((a, b) => b.value - a.value);

        // 4. Group by User within each Date
        return sortedDates.map(dateGroup => {
            const userMap = new Map();
            
            for (const photo of dateGroup.items) {
                const username = photo.user.username;
                if (!userMap.has(username)) {
                    userMap.set(username, {
                        user: photo.user,
                        photos: []
                    });
                }
                userMap.get(username).photos.push(photo);
            }

            // Sort users by latest photo in that group
            const userGroups = Array.from(userMap.values()).sort((a, b) => {
                const maxA = Math.max(...a.photos.map(p => new Date(p.created_at ?? 0).getTime()));
                const maxB = Math.max(...b.photos.map(p => new Date(p.created_at ?? 0).getTime()));
                return maxB - maxA;
            });

            return {
                ...dateGroup,
                userGroups
            };
        });
    });

    const statCache = new Map();

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

    const getPhotoStats = (photo) => {
        const key = `${photo?.id ?? "no-id"}|${photo?.storage_url ?? ""}|${photo?.created_at ?? ""}`;
        if (statCache.has(key)) {
            return statCache.get(key);
        }

        const seed = hashString(key);
        const stats = {
            likes: Number.isFinite(photo?.like_count) && photo.like_count > 0
                ? photo.like_count
                : seededCount(seed, 8, 420),
            views: Number.isFinite(photo?.view_count) && photo.view_count > 0
                ? photo.view_count
                : seededCount(seed * 7, 150, 12000)
        };

        statCache.set(key, stats);
        return stats;
    };
</script>

<div class="container py-8 max-w-3xl mx-auto space-y-8 px-4 md:px-6">
    <!-- Search Section -->
    <div class="relative max-w-md mx-auto mb-8">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
            placeholder="Search users..." 
            class="pl-9 bg-background border-input" 
            bind:value={searchQuery}
        />
    </div>

    <!-- Feed -->
    <div class="space-y-12">
        {#if feed.length === 0}
            <div class="text-center py-12 text-muted-foreground">
                <p>No photos found.</p>
            </div>
        {/if}

        {#each feed as dateGroup (dateGroup.key)}
            <div class="relative">
                <!-- Date Header -->
                <div class="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-3 mb-6 border-b">
                    <h2 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-primary/50"></span>
                        {dateGroup.label}
                    </h2>
                </div>

                <div class="space-y-10 pl-2 md:pl-4 border-l border-border/40 ml-0.5 md:ml-1">
                    {#each dateGroup.userGroups as userGroup (userGroup.user.username)}
                        <div class="space-y-4">
                            <!-- User Header -->
                            <div class="flex items-center gap-3">
                                <Avatar.Root class="h-9 w-9 border border-border">
                                    {#if userGroup.user.avatar_url}
                                        <Avatar.Image src={userGroup.user.avatar_url} alt={userGroup.user.username} />
                                    {/if}
                                    <Avatar.Fallback>{userGroup.user.username?.slice(0, 2).toUpperCase() || 'U'}</Avatar.Fallback>
                                </Avatar.Root>
                                <div class="flex flex-col leading-none">
                                    <a href="/{userGroup.user.username}" class="font-semibold hover:underline decoration-primary underline-offset-4 text-sm">
                                        {userGroup.user.username}
                                    </a>
                                    <span class="text-xs text-muted-foreground mt-1">
                                        Added {userGroup.photos.length} photo{userGroup.photos.length === 1 ? '' : 's'}
                                    </span>
                                </div>
                            </div>

                            <!-- Photos Carousel -->
                            <div class="relative">
                                <Carousel.Root opts={{ align: "start", loop: false }} class="w-full">
                                    <Carousel.Content class="-ml-4">
                                        {#each userGroup.photos as photo (photo.id)}
                                            {@const stats = getPhotoStats(photo)}
                                            <Carousel.Item class="pl-4 basis-1/2 sm:basis-1/3">
                                                <a href="/{userGroup.user.username}/{photo.id}" class="group relative block aspect-[4/5] overflow-hidden rounded-lg border bg-muted shadow-sm transition-all hover:shadow-md">
                                                    <img 
                                                        src={photo.storage_url} 
                                                        alt="" 
                                                        class="h-full w-full object-cover"
                                                        loading="lazy"
                                                    />
                                                    <!-- Overlay -->
                                                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-300"></div>
                                                    
                                                    <!-- Stats -->
                                                    <div class="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between text-white text-xs opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                                                        <div class="flex items-center gap-1">
                                                            <Heart class="h-3 w-3 fill-current" />
                                                            <span>{stats.likes}</span>
                                                        </div>
                                                        <div class="flex items-center gap-1">
                                                            <Eye class="h-3 w-3" />
                                                            <span>{stats.views}</span>
                                                        </div>
                                                    </div>
                                                </a>
                                            </Carousel.Item>
                                        {/each}
                                    </Carousel.Content>
                                    {#if userGroup.photos.length > 2}
                                        <Carousel.Previous class="left-2 hidden md:flex h-8 w-8" />
                                        <Carousel.Next class="right-2 hidden md:flex h-8 w-8" />
                                    {/if}
                                </Carousel.Root>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        {/each}
    </div>
</div>
