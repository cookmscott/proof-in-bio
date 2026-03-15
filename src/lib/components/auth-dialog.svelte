<script>
	import { Button } from '$lib/ui/button/index.js';
	import { Card, CardContent } from '$lib/ui/card/index.js';
	import { Input } from '$lib/ui/input/index.js';
	import { Label } from '$lib/ui/label/index.js';
	import { goto, invalidateAll, invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { authDialog } from '$lib/stores/auth';

	// Props
	// The `open` prop is now primarily controlled by the store, but kept for initial rendering or direct control if needed.
	// `onsuccess` and `onclose` are still useful for external handlers.
	let { supabase, open = true, onsuccess, onclose, mode = 'login' } = $props();

	// Internal state
	let email = $state('');
	let loading = $state(false);
	let error = $state('');
	let success = $state(false);

	$effect(() => {
		if (!open) {
			success = false;
			error = '';
		}
	});

	async function handleSubmit(e) {
		e.preventDefault();
		loading = true;
		error = '';
		success = false;

		try {
			const { error: authError } = await supabase.auth.signInWithOtp({
				email,
				options: {
					emailRedirectTo: `${$page.url.origin}/auth/callback`
				}
			});

			if (authError) {
				error = authError.message;
			} else {
				success = true;
				onsuccess?.({ detail: { type: 'magic-link', email } });
			}
		} catch {
			error = 'An unexpected error occurred';
		} finally {
			loading = false;
		}
	}

	async function handleGoogleSignIn() {
		loading = true;
		error = '';

		try {
			const { error: authError } = await supabase.auth.signInWithOAuth({
				provider: 'google',
				options: {
					redirectTo: `${$page.url.origin}/auth/callback`
				}
			});

			if (authError) {
				error = authError.message;
				loading = false;
			}
			// Note: OAuth redirects, so we don't set loading = false here
		} catch {
			error = 'Failed to sign in with Google';
			loading = false;
		}
	}

	function closeDialog() {
		success = false;
		error = '';
		authDialog.set({ open: false, mode: 'login' }); // Close dialog via store
	}
</script>

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
		<Card class="overflow-hidden p-0 w-full max-w-sm md:max-w-3xl">
			<CardContent class="grid p-0 md:grid-cols-2">
				<form onsubmit={handleSubmit} class="p-6 md:p-8">
					<div class="flex flex-col gap-6">
						<div class="flex items-center justify-between">
							<div></div>
							<button
								type="button"
								class="text-gray-500 hover:text-gray-700"
								onclick={closeDialog}
								aria-label="Close dialog"
							>
								<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M6 18L18 6M6 6l12 12"
									></path>
								</svg>
							</button>
						</div>
						<div class="flex flex-col items-center text-center">
							<h1 class="text-2xl font-bold">Welcome to Proof in Bio</h1>
							<p class="text-muted-foreground text-balance">
								{success ? 'Check your email for a magic link!' : 'Use Google for the fastest way to sign in or create an account'}
							</p>
						</div>

						{#if error}
							<div class="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
								{error}
							</div>
						{/if}

						{#if success}
							<div class="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md text-center">
								We've sent a magic link to <strong>{email}</strong>. 
								Please check your inbox and click the link to continue.
							</div>
							<Button type="button" variant="outline" class="w-full" onclick={() => success = false}>
								Use a different email
							</Button>
						{:else}
							<Button
								type="button"
								class="w-full h-12 text-base font-medium"
								onclick={handleGoogleSignIn}
								disabled={loading}
							>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="size-5">
									<path
										d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
										fill="currentColor"
									/>
								</svg>
								{loading ? 'Redirecting to Google...' : 'Continue with Google'}
							</Button>
							<p class="text-muted-foreground text-center text-sm">
								Recommended for sign in and account creation.
							</p>

						<div
							class="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t"
						>
							<span class="bg-card text-muted-foreground relative z-10 px-2">
								Or use email instead
							</span>
						</div>
							<div class="grid gap-3">
								<Label for="email">Email</Label>
								<Input
									id="email"
									name="email"
									type="email"
									placeholder="m@example.com"
									bind:value={email}
									required
								/>
							</div>
							<Button type="submit" variant="outline" class="w-full text-muted-foreground" disabled={loading}>
								{loading ? 'Sending link...' : 'Send Magic Link'}
							</Button>
						{/if}
					</div>
				</form>
				<div class="bg-muted relative hidden md:block">
					<img
						src={'https://picsum.photos/600/800?random=' + Math.floor(Math.random() * 1000)}
						alt="placeholder"
						class="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
					/>
				</div>
			</CardContent>
		</Card>
	</div>
{/if}
