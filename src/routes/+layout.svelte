<!--
  File: src/routes/+layout.svelte
  Description: This is the root layout for the entire application. It applies global styles
  and sets up the dark mode watcher, ensuring a consistent theme across all pages,
  including the login page and the main app pages.
-->
<script>
  import '../app.css';
  import { Toaster } from '$lib/components/ui/sonner';
  import ProfileMenu from '$lib/components/ui/profile-menu.svelte';
  import { onMount } from 'svelte';

  let { children } = $props();

  // Dark mode logic for the whole site
  onMount(() => {
	const saved = localStorage.getItem("theme");
	if (saved === "dark") {
	  document.documentElement.classList.add("dark");
	} else if (saved === "light") {
	  document.documentElement.classList.remove("dark");
	} else {
	  // System preference
	  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
		document.documentElement.classList.add("dark");
	  } else {
		document.documentElement.classList.remove("dark");
	  }
	}
  });
</script>

<Toaster />
<ProfileMenu />

<!-- This {@render children()} tag is where SvelteKit will inject the content of your pages -->
	{@render children?.()}


