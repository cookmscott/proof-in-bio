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
import { invalidate } from '$app/navigation';
import GlobalAvatar from '$lib/components/global-avatar.svelte';
import { untrack } from 'svelte';

let { data, children } = $props();
let { session, supabase, user } = $derived(data);

$effect(() => {
	const { data: authData } = supabase.auth.onAuthStateChange((_, newSession) => {
		if (newSession?.expires_at !== session?.expires_at) {
			invalidate('supabase:auth');
		}
	});

	return () => authData.subscription.unsubscribe();
});
</script>


<ModeWatcher />
<Toaster />
<GlobalAvatar {session} {user} {supabase} />

<!-- This {@render children()} tag is where SvelteKit will inject the content of your pages -->
{@render children?.()}


