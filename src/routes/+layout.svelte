<!--
  File: src/routes/+layout.svelte
  Description: This is the root layout for the entire application. It applies global styles
  and sets up the dark mode watcher, ensuring a consistent theme across all pages,
  including the login page and the main app pages.
-->
<script>
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/ui/sonner';
	import { invalidateAll } from '$app/navigation';
	import { authDialog } from '$lib/stores/auth';
	import AuthDialog from '$lib/components/auth-dialog.svelte';
	import GlobalAvatar from '$lib/components/global-avatar.svelte';

	let { data, children } = $props();
	let { session, supabase, user } = $derived(data);

	$effect(() => {
		const { data: authData } = supabase.auth.onAuthStateChange((_, newSession) => {
			// Invalidate all data to ensure UI updates with new session info
			if (newSession?.expires_at !== session?.expires_at) {
				invalidateAll();
			}
		});

		return () => authData.subscription.unsubscribe();
	});

	// Auth dialog state from store
	let showAuthDialog = $state(false);
	let authMode = $state('login');

	$effect(() => {
		const unsubscribe = authDialog.subscribe(value => {
			showAuthDialog = value.open;
			authMode = value.mode;
		});
		return unsubscribe;
	});

	function handleAuthSuccess(event) {
		console.log('User authenticated:', event.detail);
		authDialog.set({ open: false, mode: 'login' }); // Close dialog and reset mode
		// User will be automatically redirected by the dialog if successful login/signup
	}

	function handleAuthClose() {
		authDialog.set({ open: false, mode: 'login' }); // Close dialog and reset mode
	}
</script>

<div class="min-h-svh flex flex-col">
	<ModeWatcher />
	<Toaster />

	<header class="border-b bg-background/95 backdrop-blur z-40">
		<div class="container flex h-16 items-center justify-between px-4">
			<a href="/" class="font-bold tracking-tight"> ProofInBio </a>
			<GlobalAvatar {session} {user} {supabase} />
		</div>
	</header>

	<main class="flex-1">
		<!--
      This {@render children()} tag is where SvelteKit will inject the content of your pages.
      It's now wrapped in a <main> tag for better semantics.
    -->
		{@render children?.()}
	</main>

	<!-- Auth Dialog - Rendered at the root level to ensure proper fixed positioning -->
	<AuthDialog
		{supabase}
		open={showAuthDialog}
		onclose={handleAuthClose}
		onsuccess={handleAuthSuccess}
	/>
</div>
