<script>
	import { Share2, Plus, User, Upload } from 'lucide-svelte';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/ui/avatar';
	import { Button } from '$lib/ui/button';
	import { Badge } from '$lib/ui/badge';
	import { Card } from '$lib/ui/card';
	import { AspectRatio } from '$lib/ui/aspect-ratio';
	import { Skeleton } from '$lib/ui/skeleton';
	import ShareDrawer from '$lib/components/share-drawer.svelte';
	import AuthenticatedPhotosAlert from '$lib/components/authenticated-photos-alert.svelte';
    import C2paUploadDialog from '$lib/components/c2pa-upload-dialog.svelte';

	let { data } = $props();

    let uploadDialogOpen = $state(false);
    let uploadDialogComponent = $state(null);
    let isDragging = $state(false);
    let dragCounter = 0; // Use a counter to prevent flickering on child elements

    function handleWindowDrop(e) {
        e.preventDefault();
        isDragging = false;
        dragCounter = 0;
        if (e.dataTransfer?.files?.length) {
            uploadDialogComponent?.processFiles(e.dataTransfer.files);
        }
    }

    function handleWindowDragOver(e) {
        e.preventDefault();
    }

    function handleWindowDragEnter(e) {
        e.preventDefault();
        dragCounter++;
        if (e.dataTransfer?.items?.length > 0) {
            isDragging = true;
        }
    }

    function handleWindowDragLeave(e) {
        e.preventDefault();
        dragCounter--;
        if (dragCounter === 0) {
            isDragging = false;
        }
    }

    function openUploadDialog(e) {
        // Prevent default behavior if any
        if (e && typeof e.preventDefault === 'function') {
            e.preventDefault();
        }
        console.log('Add Photos clicked, opening dialog...');
        uploadDialogOpen = true;
    }

	// Use derived runes to reactively access profile and photos from loaded data
	let profile = $derived(data.profile);
	let photos = $derived(data.photos);
	let canEdit = $derived(data.canEdit);

	// Extract interests from the nested structure
	let interests = $derived(profile.interests.map((i) => i.interest));

	// Track loaded state for each image in the gallery
	let loaded = $state(Array(photos.length).fill(false));

	// Reset loaded state if photos array changes
	$effect(() => {
		if (photos.length !== loaded.length) {
			loaded = Array(photos.length).fill(false);
		}
	});
</script>

<svelte:window 
    ondrop={handleWindowDrop} 
    ondragover={handleWindowDragOver} 
    ondragenter={handleWindowDragEnter}
    ondragleave={handleWindowDragLeave}
/>

{#if isDragging}
    <div class="fixed inset-0 z-[1000] flex items-center justify-center bg-background/20 backdrop-blur-sm pointer-events-none">
        
        <div class="bg-background/40 backdrop-blur-xl border-2 border-dashed border-primary/50 p-12 rounded-3xl shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200 ring-1 ring-white/10">
            
            <div class="p-5 rounded-full bg-primary/10 shadow-inner">
                <Upload class="h-12 w-12 text-primary animate-pulse" />
            </div>
            
            <div class="space-y-1 text-center">
                <p class="text-3xl font-bold text-primary tracking-tight">Drop to Add Photos</p>
                <p class="text-muted-foreground font-medium">Import and verify your images instantly</p>
            </div>
        </div>
    </div>
{/if}

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
        <!-- <div class="absolute top-0 left-0 h-[400px] w-full hidden dark:block">
            <img
                src="https://picsum.photos/1600/900?random=hero"
                alt="Profile hero background"
                class="hero-background-image h-full w-full object-cover"
            />
            <div
                class="absolute inset-0 bg-gradient-to-t from-background via-background/70 via-background/30 to-transparent"
            ></div>
        </div>
        -->

        <!-- 
          Main content container. 
          'relative' and 'z-10' ensure it stacks on top of the absolute background.
          'container', 'mx-auto', and 'max-w-screen-lg' center and constrain the content.
        -->
        <main class="relative z-10 container mx-auto max-w-screen-lg px-4 sm:pt-20 pt-8 pb-8">
            <!-- Profile Header Section -->
            <div class="relative z-10 mb-8">
                <div class="flex flex-row items-start gap-4">
                    <Avatar class="h-20 w-20 shrink-0 md:h-32 md:w-32">
                        <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
                        <AvatarFallback>
                            <User class="h-12 w-12" />
                        </AvatarFallback>
                    </Avatar>

                    <div class="flex-grow min-w-0">
                        <h1 class="text-xl font-bold tracking-tight leading-tight sm:text-3xl">
                            {profile.display_name || profile.username}
                        </h1>
                        <p class="text-muted-foreground text-sm sm:text-base">@{profile.username}</p>
                        <p class="mt-2 max-w-xl text-balance text-sm sm:text-base">{profile.bio}</p>
                        <div class="mt-3 flex flex-wrap gap-2">
                            {#each interests as interest}
                                <Badge variant="secondary">{interest}</Badge>
                            {/each}
                        </div>
                    </div>
                </div>

                <div class="mt-4 flex gap-2 md:absolute md:top-0 md:right-0 md:mt-0">
                    <ShareDrawer 
                        title={profile.display_name || profile.username}
                        description={profile.bio || `Check out ${profile.display_name}'s profile on Proof in Bio`}
                        label="Share Profile"
                        class="flex-1 md:flex-none"
                    />
                    {#if canEdit}
                        <Button href="/{data.profile.username}/edit" class="flex-1 md:flex-none">Edit Profile</Button>
                    {/if}
                </div>
            </div>

            <!-- Authenticated Photos Alert -->     
            <AuthenticatedPhotosAlert />
            
            <!-- Photo Gallery Section -->
            <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-4">
				{#each photos as photo, i (photo.id)}
					<a href={`/${profile.username}/${photo.id}`} class="group">
                        <Card class="overflow-hidden border-0 transition-all rounded-sm py-0 duration-200 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1">
                            <AspectRatio ratio={1} class="bg-slate-100 dark:bg-slate-800 rounded-sm relative">
                                {#if !loaded[i]}
                                    <Skeleton class="h-full w-full absolute" />
                                {/if}
                                <img
									src={photo.storage_url}
									alt={photo.title || 'User photo'}
                                    class="h-full w-full object-cover rounded-sm transition-opacity duration-300"
                                    style="opacity: {loaded[i] ? 1 : 0};"
                                    onload={() => loaded[i] = true}
                                />
                            </AspectRatio>
                        </Card>
                    </a>
				{/each}
            </div>
        </main>
    </div>

    <!-- Fixed "Add Images" Button -->
    <Button 
        style="z-index: 999" 
        class="group fixed bottom-6 right-6 h-14 min-w-[3.5rem] rounded-full shadow-2xl transition-all duration-300 ease-out hover:pr-6 hover:pl-4 flex items-center justify-center overflow-hidden init-expand-btn"
        onclick={openUploadDialog}
    >
        <span class="flex items-center">
            <Plus class="h-10 w-10 transition-[margin] duration-300 ease-out group-hover:mr-2 init-expand-icon" />
            <span class="max-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 ease-out group-hover:max-w-[6rem] init-expand-text">
                Add Images
            </span>
        </span>
        <span class="sr-only">Add Images</span>
    </Button>
</div>

<C2paUploadDialog bind:this={uploadDialogComponent} bind:open={uploadDialogOpen} supabase={data.supabase} />

<style>
    @keyframes expand-btn {
        0%, 80% { padding-right: 1.5rem; padding-left: 1rem; }
        100% { padding-right: 0; padding-left: 0; }
    }
    @keyframes expand-icon {
        0%, 80% { margin-right: 0.5rem; }
        100% { margin-right: 0; }
    }
    @keyframes expand-text {
        0%, 80% { max-width: 6rem; }
        100% { max-width: 0; }
    }
    :global(.init-expand-btn) { animation: expand-btn 3s ease-out; }
    :global(.init-expand-icon) { animation: expand-icon 3s ease-out; }
    :global(.init-expand-text) { animation: expand-text 3s ease-out; }
</style>
