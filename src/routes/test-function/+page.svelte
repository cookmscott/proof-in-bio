<script>
    import { Button } from '$lib/ui/button';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/ui/card';
    import { Loader2, Terminal, AlertCircle, Upload, FileImage } from 'lucide-svelte';

    let { data } = $props();
    let { supabase, session } = $derived(data);

    let loading = $state(false);
    let response = $state(null);
    let error = $state(null);
    let selectedFile = $state(null);
    let fileInput = $state(null);

    function handleFileSelect(e) {
        const file = e.target.files?.[0];
        if (file) {
            selectedFile = file;
            response = null;
            error = null;
        }
    }

    async function callFunction() {
        if (!selectedFile) return;

        loading = true;
        response = null;
        error = null;

        try {
            const formData = new FormData();
            formData.append('image', selectedFile);

            const { data, error: functionError } = await supabase.functions.invoke('hello-world', {
                body: formData,
            });

            if (functionError) throw functionError;
            response = data;
        } catch (err) {
            console.error('Function call failed:', err);
            error = err.message || 'Failed to call function';
        } finally {
            loading = false;
        }
    }
</script>

<div class="container mx-auto max-w-2xl py-12 px-4">
    <Card>
        <CardHeader>
            <CardTitle>C2PA Verification Test</CardTitle>
            <CardDescription>Upload an image to verify its C2PA metadata via Edge Function.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-6">
            {#if session}
                <div class="flex flex-col gap-6">
                    <p class="text-sm text-muted-foreground">
                        You are logged in as <span class="font-medium text-foreground">{session.user.email}</span>.
                    </p>
                    
                    <div class="grid gap-2">
                        <input
                            type="file"
                            accept="image/*"
                            onchange={handleFileSelect}
                            class="hidden"
                            bind:this={fileInput}
                        />
                        <div class="flex items-center gap-4">
                            <Button 
                                variant="outline" 
                                onclick={() => fileInput?.click()}
                                class="w-full sm:w-auto"
                            >
                                <Upload class="mr-2 h-4 w-4" />
                                {selectedFile ? 'Change File' : 'Select Image'}
                            </Button>
                            {#if selectedFile}
                                <span class="text-sm text-muted-foreground flex items-center gap-2">
                                    <FileImage class="h-4 w-4" />
                                    {selectedFile.name}
                                </span>
                            {/if}
                        </div>
                    </div>

                    <Button 
                        onclick={callFunction} 
                        disabled={loading || !selectedFile} 
                        class="w-full sm:w-auto"
                    >
                        {#if loading}
                            <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                            Verifying...
                        {:else}
                            <Terminal class="mr-2 h-4 w-4" />
                            Upload & Verify
                        {/if}
                    </Button>

                    {#if response}
                        <div class="rounded-md bg-muted p-4 overflow-x-auto">
                            <h3 class="text-sm font-semibold mb-2">C2PA Metadata Result:</h3>
                            <pre class="text-xs font-mono">{JSON.stringify(response, null, 2)}</pre>
                        </div>
                    {/if}

                    {#if error}
                        <div class="rounded-md bg-destructive/10 p-4 text-sm text-destructive flex items-center gap-2">
                            <AlertCircle class="h-4 w-4" />
                            {error}
                        </div>
                    {/if}
                </div>
            {:else}
                <div class="flex flex-col items-center justify-center gap-4 py-8 text-center">
                    <div class="rounded-full bg-muted p-3">
                        <AlertCircle class="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div class="space-y-1">
                        <h3 class="font-semibold">Authentication Required</h3>
                        <p class="text-sm text-muted-foreground max-w-xs mx-auto">
                            You must be logged in to access this function.
                        </p>
                    </div>
                    <Button href="/auth" variant="outline">Sign In</Button>
                </div>
            {/if}
        </CardContent>
    </Card>
</div>
