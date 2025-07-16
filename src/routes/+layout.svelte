<!--
  File: src/routes/+layout.svelte
  Description: This is the root layout for the entire application. It applies global styles
  and sets up the dark mode watcher, ensuring a consistent theme across all pages,
  including the login page and the main app pages.
-->
<script>
import '../app.css';
import { ModeWatcher } from 'mode-watcher';
import { Toaster } from '$lib/components/ui/sonner';
import { invalidate } from '$app/navigation';
import { onMount } from 'svelte';
import GlobalAvatar from '$lib/components/global-avatar.svelte';

let { data, children } = $props();
let { session, supabase, user } = $derived(data);

onMount(() => {
	const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
		if (newSession?.expires_at !== session?.expires_at) {
			invalidate('supabase:auth');
		}
	});

	return () => data.subscription.unsubscribe();
});
</script>


<ModeWatcher />
<Toaster />
<GlobalAvatar {session} {user} />

<!-- This {@render children()} tag is where SvelteKit will inject the content of your pages -->
{@render children?.()}


