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
	let email = $state(''); // Keep email, password, username, display_name as local state
	let password = $state('');
	let username = $state('');
	let display_name = $state('');
	let isLogin = $state(true);
	let loading = $state(false);
	let error = $state('');
	let usernameError = $state('');

	// Sync internal isLogin state with prop/store mode
	$effect(() => {
		isLogin = mode === 'login';
	});

	// Username validation regex: lowercase letters, numbers, hyphens only
	// Cannot start/end with hyphen, no consecutive hyphens, 3-50 chars
	const usernameRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

	function validateUsername(value) {
		if (!value) {
			usernameError = '';
			return false;
		}
		if (value.length < 3) {
			usernameError = 'Username must be at least 3 characters';
			return false;
		}
		if (value.length > 50) {
			usernameError = 'Username must be 50 characters or less';
			return false;
		}
		if (!usernameRegex.test(value)) {
			usernameError =
				'Username must be lowercase letters, numbers, and hyphens only (e.g., john-doe-123)';
			return false;
		}
		usernameError = '';
		return true;
	}

	$effect(() => {
		if (!isLogin && username) {
			validateUsername(username);
		}
	});

	async function handleSubmit(e) {
		e.preventDefault();
		loading = true;
		error = '';

		// Validate username for signup
		if (!isLogin && !validateUsername(username)) {
			loading = false;
			error = usernameError;
			return;
		}

		try {
			if (isLogin) {
				const { error: authError } = await supabase.auth.signInWithPassword({
					email,
					password
				});

				if (authError) {
					error = authError.message;
				} else {
					await invalidateAll(); // Invalidate all data to ensure UI updates with new session info
					onsuccess?.({ detail: { type: 'login' } });
					goto('/private');
				}
			} else {
				const { error: authError } = await supabase.auth.signUp({
					email,
					password,
					options: {
						data: {
							username,
							display_name
						}
					}
				});

				if (authError) {
					error = `${authError.message} - Please make sure the database has been reset with the new schema.`;
				} else {
					onsuccess?.({ detail: { type: 'signup' } }); // Call external success handler
					// For signup, usually redirect to confirmation page or show success message
					error = 'Check your email for a confirmation link!';
				}
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

	function toggleMode() {
		authDialog.set({ open: true, mode: isLogin ? 'signup' : 'login' }); // Update store to change mode
		error = '';
	}

	function closeDialog() {
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
							<h1 class="text-2xl font-bold">{isLogin ? 'Welcome back' : 'Create account'}</h1>
							<p class="text-muted-foreground text-balance">
								{isLogin ? 'Login to your Proof in Bio account' : 'Sign up for Proof in Bio'}
							</p>
						</div>

						{#if error}
							<div class="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
								{error}
							</div>
						{/if}

						{#if !isLogin}
							<div class="grid gap-2">
								<Label for="username">Username</Label>
								<Input
									id="username"
									name="username"
									type="text"
									placeholder="john-doe"
									bind:value={username}
									required
									class={usernameError ? 'border-red-500' : ''}
								/>
								{#if usernameError}
									<p class="text-xs text-red-600">{usernameError}</p>
								{:else}
									<p class="text-xs text-muted-foreground">
										Lowercase letters, numbers, and hyphens only
									</p>
								{/if}
							</div>
							<div class="grid gap-3">
								<Label for="display_name">Display Name</Label>
								<Input
									id="display_name"
									name="display_name"
									type="text"
									placeholder="John Doe"
									bind:value={display_name}
									required
								/>
							</div>
						{/if}

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
						<div class="grid gap-3">
							<div class="flex items-center">
								<Label for="password">Password</Label>
							</div>
							<Input id="password" name="password" type="password" bind:value={password} required />
						</div>
						<Button type="submit" class="w-full" disabled={loading}>
							{loading ? 'Please wait...' : isLogin ? 'Login' : 'Sign Up'}
						</Button>
						<div
							class="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t"
						>
							<span class="bg-card text-muted-foreground relative z-10 px-2">
								Or continue with
							</span>
						</div>
						<div class="grid grid-cols-3 gap-4">
							<Button variant="outline" type="button" class="w-full" disabled>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="size-5">
									<path
										d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
										fill="currentColor"
									/>
								</svg>
								<span class="sr-only">Login with Apple</span>
							</Button>
							<Button
								variant="outline"
								type="button"
								class="w-full flex items-center justify-center gap-2"
								onclick={handleGoogleSignIn}
								disabled={loading}
							>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="size-5">
									<path
										d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
										fill="currentColor"
									/>
								</svg>
								<span class="sr-only">{isLogin ? 'Login with Google' : 'Continue with Google'}</span
								>
							</Button>
							<Button variant="outline" type="button" class="w-full" disabled>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="size-5">
									<path
										d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z"
										fill="currentColor"
									/>
								</svg>
								<span class="sr-only">Login with Meta</span>
							</Button>
						</div>
						<div class="text-center text-sm">
							{isLogin ? "Don't have an account?" : 'Already have an account?'}
							<button
								type="button"
								class="underline underline-offset-4 text-primary"
								onclick={toggleMode}
							>
								{isLogin ? 'Sign up' : 'Login'}
							</button>
						</div>
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
