<script>
    import { User, Upload, Camera } from 'lucide-svelte';
    import { Avatar, AvatarFallback, AvatarImage } from '$lib/ui/avatar';
    import { Button } from '$lib/ui/button';
    import { Badge } from '$lib/ui/badge';
    import { Card } from '$lib/ui/card';
    import { enhance } from '$app/forms';

    let { data, form } = $props();

    let editing = $state(false);
    let formData = $state({
        username: data.profile?.username || '',
        display_name: data.profile?.display_name || '',
        bio: data.profile?.bio || '',
        website: data.profile?.website || '',
        location: data.profile?.location || '',
        interests: data.interests?.join(', ') || ''
    });

    let avatarFile = $state(null);
    let avatarPreview = $state(null);

    function handleAvatarChange(event) {
        const file = event.target.files?.[0];
        if (file) {
            avatarFile = file;
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                avatarPreview = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    $effect(() => {
        if (form?.success) {
            editing = false;
        }
    });

    $effect(() => {
        if (editing) {
            formData = {
                username: data.profile?.username || '',
                display_name: data.profile?.display_name || '',
                bio: data.profile?.bio || '',
                website: data.profile?.website || '',
                location: data.profile?.location || '',
                interests: data.interests?.join(', ') || ''
            };
            // Reset avatar preview when entering edit mode
            avatarFile = null;
            avatarPreview = null;
        }
    });
</script>

<div class="bg-background text-foreground min-h-screen">
    <div class="relative">
        <!-- Hero Background -->
        <div class="absolute top-0 left-0 h-[300px] w-full hidden dark:block">
            <div class="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30"></div>
        </div>

        <main class="relative z-10 container mx-auto max-w-screen-lg px-4 pt-20 pb-8">
            <!-- Profile Header -->
            <div class="relative z-10 mb-8 flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
                <Avatar class="h-24 w-24 md:h-32 md:w-32">
                    <AvatarImage src={data.profile?.avatar_url} alt={data.profile?.display_name || data.profile?.username} />
                    <AvatarFallback>
                        <User class="h-12 w-12" />
                    </AvatarFallback>
                </Avatar>

                <div class="flex-grow">
                    {#if !editing}
                        <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">
                            {data.profile?.display_name || data.profile?.username || 'User'}
                        </h1>
                        <p class="text-muted-foreground">@{data.profile?.username || 'username'}</p>
                        {#if data.profile?.bio}
                            <p class="mt-2 max-w-xl text-balance">{data.profile.bio}</p>
                        {/if}
                        {#if data.profile?.website}
                            <a href={data.profile.website} target="_blank" rel="noopener noreferrer" class="text-sm text-blue-500 hover:underline mt-1 block">
                                {data.profile.website}
                            </a>
                        {/if}
                        {#if data.profile?.location}
                            <p class="text-sm text-muted-foreground mt-1">{data.profile.location}</p>
                        {/if}
                        {#if data.interests?.length > 0}
                            <div class="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
                                {#each data.interests as interest}
                                    <Badge variant="secondary">{interest}</Badge>
                                {/each}
                            </div>
                        {/if}
                    {/if}
                </div>

                <!-- Only show Edit button if user can edit (viewing their own profile) -->
                {#if !editing && data.canEdit}
                    <div class="mt-4 md:mt-0 md:absolute md:top-0 md:right-0">
                        <Button onclick={() => editing = true}>Edit Profile</Button>
                    </div>
                {/if}
            </div>

            <!-- Edit Form - Only visible if user can edit -->
            {#if editing && data.canEdit}
                <Card class="p-6 mb-8">
                    <h2 class="text-xl font-semibold mb-4">Edit Profile</h2>

                    {#if form?.error}
                        <div class="mb-4 p-3 bg-destructive/10 border border-destructive rounded-md text-destructive text-sm">
                            {form.error}
                        </div>
                    {/if}

                    <form method="POST" action="?/updateProfile" use:enhance enctype="multipart/form-data">
                        <div class="space-y-4">
                            <!-- Profile Picture Upload -->
                            <div>
                                <span class="block text-sm font-medium mb-2">Profile Picture</span>
                                <div class="flex items-center gap-4">
                                    <Avatar class="h-24 w-24">
                                        <AvatarImage src={avatarPreview || data.profile?.avatar_url} alt="Profile preview" />
                                        <AvatarFallback>
                                            <User class="h-12 w-12" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div class="flex-1">
                                        <input
                                            type="file"
                                            id="avatar"
                                            name="avatar"
                                            accept="image/jpeg,image/jpg,image/png,image/webp"
                                            onchange={handleAvatarChange}
                                            class="hidden"
                                        />
                                        <label for="avatar">
                                            <Button type="button" variant="outline" onclick={() => document.getElementById('avatar').click()}>
                                                <Camera class="h-4 w-4 mr-2" />
                                                {avatarPreview ? 'Change Photo' : 'Upload Photo'}
                                            </Button>
                                        </label>
                                        <p class="text-xs text-muted-foreground mt-2">
                                            JPG, PNG or WebP. Max 2MB.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label for="username" class="block text-sm font-medium mb-1">Username</label>
                                <input
                                    type="text"
                                    id="username"
                                    value={formData.username}
                                    readonly
                                    disabled
                                    class="w-full px-3 py-2 border rounded-md bg-muted text-muted-foreground cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label for="display_name" class="block text-sm font-medium mb-1">Display Name</label>
                                <input
                                    type="text"
                                    id="display_name"
                                    name="display_name"
                                    bind:value={formData.display_name}
                                    class="w-full px-3 py-2 border rounded-md bg-background"
                                />
                            </div>

                            <div>
                                <label for="bio" class="block text-sm font-medium mb-1">Bio</label>
                                <textarea
                                    id="bio"
                                    name="bio"
                                    bind:value={formData.bio}
                                    rows="3"
                                    class="w-full px-3 py-2 border rounded-md bg-background"
                                ></textarea>
                            </div>

                            <div>
                                <label for="website" class="block text-sm font-medium mb-1">Website</label>
                                <input
                                    type="url"
                                    id="website"
                                    name="website"
                                    bind:value={formData.website}
                                    class="w-full px-3 py-2 border rounded-md bg-background"
                                />
                            </div>

                            <div>
                                <label for="location" class="block text-sm font-medium mb-1">Location</label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    bind:value={formData.location}
                                    class="w-full px-3 py-2 border rounded-md bg-background"
                                />
                            </div>

                            <div>
                                <label for="interests" class="block text-sm font-medium mb-1">Interests (comma-separated)</label>
                                <input
                                    type="text"
                                    id="interests"
                                    name="interests"
                                    bind:value={formData.interests}
                                    placeholder="Photography, Travel, Nature"
                                    class="w-full px-3 py-2 border rounded-md bg-background"
                                />
                            </div>
                        </div>

                        <div class="flex gap-2 mt-6">
                            <Button type="submit">Save Changes</Button>
                            <Button type="button" variant="secondary" onclick={() => editing = false}>Cancel</Button>
                        </div>
                    </form>
                </Card>
            {/if}

            <!-- User Stats/Info -->
            {#if !editing && data.profile}
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <Card class="p-4 text-center">
                        <div class="text-2xl font-bold">0</div>
                        <div class="text-sm text-muted-foreground">Photos</div>
                    </Card>
                    <Card class="p-4 text-center">
                        <div class="text-2xl font-bold">0</div>
                        <div class="text-sm text-muted-foreground">Followers</div>
                    </Card>
                    <Card class="p-4 text-center">
                        <div class="text-2xl font-bold">0</div>
                        <div class="text-sm text-muted-foreground">Following</div>
                    </Card>
                </div>
            {/if}

            <!-- Empty State for Photos -->
            {#if !editing}
                <Card class="p-12 text-center">
                    <User class="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 class="text-xl font-semibold mb-2">No photos yet</h3>
                    <p class="text-muted-foreground mb-4">
                        {#if data.canEdit}
                            Start sharing your authentic moments
                        {:else}
                            This user hasn't shared any photos yet
                        {/if}
                    </p>
                    {#if data.canEdit}
                        <Button>Upload Your First Photo</Button>
                    {/if}
                </Card>
            {/if}
        </main>
    </div>
</div>
