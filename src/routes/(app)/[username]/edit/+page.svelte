<script>
	import { User, Camera, ArrowLeft, X, Loader2 } from 'lucide-svelte';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/ui/avatar';
	import { Badge } from '$lib/ui/badge';
	import { Button } from '$lib/ui/button';
	import { Card, CardFooter } from '$lib/ui/card';
	import { enhance } from '$app/forms';
    import { page } from '$app/stores';
	import { toast } from 'svelte-sonner';

	let { data, form } = $props();

	let formData = $state({
		username: data.profile?.username || '',
		display_name: data.profile?.display_name || '',
		bio: data.profile?.bio || '',
		website: data.profile?.website || '',
		location: data.profile?.location || '',
		interests: data.interests?.join(', ') || ''
	});

    let submitting = $state(false);

    // Update formData when data prop changes (e.g. after successful invalidation)
    $effect(() => {
        formData = {
            username: data.profile?.username || '',
            display_name: data.profile?.display_name || '',
            bio: data.profile?.bio || '',
            website: data.profile?.website || '',
            location: data.profile?.location || '',
            interests: data.interests?.join(', ') || ''
        };
        interestsList = data.interests || [];
    });

	let avatarPreview = $state(null);

	function handleAvatarChange(event) {
		const file = event.target.files?.[0];
		if (file) {
			// Create preview
			const reader = new FileReader();
			reader.onload = (e) => {
				avatarPreview = e.target.result;
			};
			reader.readAsDataURL(file);
		}
	}

    let interestsList = $state(data.interests || []);
    let interestInput = $state('');

    function addInterest() {
        const val = interestInput.trim();
        if (val && !interestsList.includes(val)) {
            interestsList = [...interestsList, val];
            interestInput = '';
        }
    }

    function removeInterest(interest) {
        interestsList = interestsList.filter(i => i !== interest);
    }

    function handleInterestKeydown(e) {
        if (['Enter', ',', ' '].includes(e.key)) {
            e.preventDefault();
            addInterest();
        } else if (e.key === 'Backspace' && interestInput === '' && interestsList.length > 0) {
            interestsList = interestsList.slice(0, -1);
        }
    }
</script>

<div class="min-h-screen bg-muted/30 py-10">
    <div class="container mx-auto max-w-3xl px-4">
        <div class="mb-8">
            <a href="/{data.profile.username}" class="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-4">
                <ArrowLeft class="mr-2 h-4 w-4" />
                Back to Profile
            </a>
            <h1 class="text-3xl font-bold tracking-tight text-foreground">Edit Profile</h1>
            <p class="text-muted-foreground mt-1">Manage your profile settings and public preferences.</p>
        </div>

    <Card class="overflow-hidden border-border/50 shadow-sm py-0">
        <form 
            method="POST" 
            use:enhance={() => {
                submitting = true;
                return async ({ result, update }) => {
                    submitting = false;
                    if (result.type === 'success') {
                        toast.success('Profile updated successfully!');
                    } else if (result.type === 'failure') {
                        toast.error(result.data?.error || 'Failed to update profile');
                    }
                    await update({ reset: false });
                };
            }} 
            enctype="multipart/form-data"
        >
            <div class="p-6 md:p-8 space-y-8">
                <!-- Profile Picture Upload -->
                <div class="flex flex-col sm:flex-row gap-8 items-start sm:items-center border-b pb-8">
                    <Avatar class="h-24 w-24 sm:h-28 sm:w-28 border-4 border-background shadow-sm">
                        <AvatarImage
                            src={avatarPreview || data.profile?.avatar_url}
                            alt="Profile preview"
                        />
                        <AvatarFallback>
                            <User class="h-10 w-10 text-muted-foreground" />
                        </AvatarFallback>
                    </Avatar>
                    <div class="space-y-2 flex-1">
                        <h3 class="font-semibold text-lg">Profile Picture</h3>
                        <p class="text-sm text-muted-foreground">
                            This will be displayed on your public profile.
                        </p>
                        <div class="pt-2 flex items-center gap-4">
                            <input
                                type="file"
                                id="avatar"
                                name="avatar"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                onchange={handleAvatarChange}
                                class="hidden"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onclick={() => document.getElementById('avatar').click()}
                            >
                                <Camera class="h-4 w-4 mr-2" />
                                {avatarPreview ? 'Change Photo' : 'Upload Photo'}
                            </Button>
                            <p class="text-xs text-muted-foreground">JPG, PNG or WebP. Max 2MB.</p>
                        </div>
                    </div>
                </div>

                <div class="grid gap-6 md:grid-cols-2">
                    <div class="space-y-2">
                        <label for="username" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            bind:value={formData.username}
                            readonly={(data.profile?.username_changes || 0) >= 2}
                            disabled={(data.profile?.username_changes || 0) >= 2}
                            class="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 {(data.profile?.username_changes || 0) >= 2 ? 'bg-muted' : 'bg-background'}"
                        />
                        <div class="flex justify-between items-center text-[0.8rem] text-muted-foreground">
                            <span>Your unique profile URL.</span>
                            <span class={(data.profile?.username_changes || 0) >= 2 ? 'text-destructive' : ''}>
                                {#if (data.profile?.username_changes || 0) >= 2}
                                    Max changes reached
                                {:else}
                                    {2 - (data.profile?.username_changes || 0)} changes remaining
                                {/if}
                            </span>
                        </div>
                    </div>

                    <div class="space-y-2">
                        <label for="display_name" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Display Name</label>
                        <input
                            type="text"
                            id="display_name"
                            name="display_name"
                            bind:value={formData.display_name}
                            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                </div>

                <div class="space-y-2">
                    <label for="bio" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Bio</label>
                    <textarea
                        id="bio"
                        name="bio"
                        bind:value={formData.bio}
                        rows="4"
                        class="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                    ></textarea>
                    <p class="text-[0.8rem] text-muted-foreground">Tell us a little bit about yourself.</p>
                </div>

                <div class="grid gap-6 md:grid-cols-2">
                    <div class="space-y-2">
                        <label for="website" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Website</label>
                        <input
                            type="url"
                            id="website"
                            name="website"
                            bind:value={formData.website}
                            placeholder="https://example.com"
                            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>

                    <div class="space-y-2">
                        <label for="location" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Location</label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            bind:value={formData.location}
                            placeholder="City, Country"
                            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                </div>

                <div class="space-y-2">
                    <label for="interests" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Interests</label>
                    <div class="flex min-h-[2.5rem] w-full flex-wrap gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                        {#each interestsList as interest}
                            <Badge variant="secondary" class="gap-1 pr-1">
                                {interest}
                                <button
                                    type="button"
                                    class="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    onclick={() => removeInterest(interest)}
                                >
                                    <X class="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                    <span class="sr-only">Remove {interest}</span>
                                </button>
                            </Badge>
                        {/each}
                        <input
                            type="text"
                            bind:value={interestInput}
                            onkeydown={handleInterestKeydown}
                            onblur={addInterest}
                            placeholder={interestsList.length === 0 ? "Photography, Travel, Nature" : ""}
                            class="flex-1 bg-transparent outline-none placeholder:text-muted-foreground min-w-[120px]"
                        />
                    </div>
                    <input type="hidden" name="interests" value={interestsList.join(', ')} />
                    <p class="text-[0.8rem] text-muted-foreground">Type and press Enter or Space to add interests.</p>
                </div>
            </div>

            <CardFooter class="bg-muted/50 px-6 py-6 flex items-center justify-between border-t">
                <p class="text-xs text-muted-foreground hidden sm:block">
                    Please save your changes before leaving.
                </p>
                <div class="flex gap-4 ml-auto">
                    <Button variant="ghost" href="/{data.profile.username}">Cancel</Button>
                    <Button type="submit" disabled={submitting}>
                        {#if submitting}
                            <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        {:else}
                            Save Changes
                        {/if}
                    </Button>
                </div>
            </CardFooter>
        </form>
    </Card>
    </div>
</div>
