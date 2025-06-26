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

	let { children } = $props();
</script>

<ModeWatcher />
<Toaster />

<!-- This {@render children()} tag is where SvelteKit will inject the content of your pages -->
	{@render children?.()}


