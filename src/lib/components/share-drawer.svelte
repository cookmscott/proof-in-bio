<script>
    import * as Drawer from "$lib/ui/drawer/index.js";
    import { Button } from "$lib/ui/button/index.js";
    import { Share, Copy, Twitter, Facebook, Linkedin, Mail, Check, Share2 } from 'lucide-svelte';
    import { onMount } from 'svelte';

    export let url = "";
    export let title = "";
    export let description = "";

    let copied = false;
    let currentUrl = "";

    onMount(() => {
        if (typeof window !== 'undefined') {
            currentUrl = url || window.location.href;
        }
    });

    async function copyToClipboard() {
        try {
            await navigator.clipboard.writeText(currentUrl);
            copied = true;
            setTimeout(() => {
                copied = false;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }

    function shareToTwitter() {
        const text = encodeURIComponent(`Check out this photo: ${title}`);
        const shareUrl = encodeURIComponent(currentUrl);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`, '_blank');
    }

    function shareToFacebook() {
        const shareUrl = encodeURIComponent(currentUrl);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, '_blank');
    }

    function shareToLinkedIn() {
        const shareUrl = encodeURIComponent(currentUrl);
        const shareTitle = encodeURIComponent(title);
        const shareDescription = encodeURIComponent(description);
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}&title=${shareTitle}&summary=${shareDescription}`, '_blank');
    }

    function shareToEmail() {
        const subject = encodeURIComponent(`Check out this photo: ${title}`);
        const body = encodeURIComponent(`I thought you might like this photo:\n\n${currentUrl}`);
        window.open(`mailto:?subject=${subject}&body=${body}`);
    }
</script>

<Drawer.Root>
    <Drawer.Trigger>
        <Button variant="secondary">
            <Share2 class="mr-2 h-4 w-4" />
            Share
        </Button>
    </Drawer.Trigger>
    <Drawer.Content>
        <div class="mx-auto w-full max-w-sm">
            <Drawer.Header>
                <Drawer.Title>Share this photo</Drawer.Title>
                <Drawer.Description>
                    Choose how you'd like to share this amazing photo
                </Drawer.Description>
            </Drawer.Header>
            
            <div class="p-4 pb-0">
                <div class="space-y-4">
                    <!-- Copy URL -->
                    <div class="space-y-2">
                        <label class="text-sm font-medium">Copy link</label>
                        <div class="flex gap-2 items-center">
                            <input
                                type="text"
                                value={currentUrl}
                                readonly
                                class="flex-1 px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                                    border border-gray-200 bg-white text-gray-900
                                    dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100
                                    h-10"
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                on:click={copyToClipboard}
                                class="flex-shrink-0 h-10 px-3"
                            >
                                {#if copied}
                                    <Check class="h-4 w-4 text-green-600" />
                                {:else}
                                    <Copy class="h-4 w-4" />
                                {/if}
                            </Button>
                        </div>
                    </div>

                    <!-- Social Media Options -->
                    <div class="space-y-2">
                        <label class="text-sm font-medium">Share to social media</label>
                        <div class="grid grid-cols-2 gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                on:click={shareToTwitter}
                                class="flex items-center justify-center gap-2"
                            >
                                <Twitter class="h-4 w-4" />
                                Twitter
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                on:click={shareToFacebook}
                                class="flex items-center justify-center gap-2"
                            >
                                <Facebook class="h-4 w-4" />
                                Facebook
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                on:click={shareToLinkedIn}
                                class="flex items-center justify-center gap-2"
                            >
                                <Linkedin class="h-4 w-4" />
                                LinkedIn
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                on:click={shareToEmail}
                                class="flex items-center justify-center gap-2"
                            >
                                <Mail class="h-4 w-4" />
                                Email
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            
            <Drawer.Footer>
                <Drawer.Close>
                    <Button variant="outline">Close</Button>
                </Drawer.Close>
            </Drawer.Footer>
        </div>
    </Drawer.Content>
</Drawer.Root>