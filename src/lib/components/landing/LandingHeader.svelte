<script>
	import { Button } from '$lib/ui/button/index.js';
	import { Camera, CheckCircle2 } from 'lucide-svelte';

	export let onAuthRequest = () => {};
</script>

<header class="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-md transition-all">
	<div class="container mx-auto max-w-7xl px-6 py-4">
		<nav class="flex items-center justify-between">
			<a href="/" class="flex items-center gap-2 group">
				<div class="relative">
					<Camera class="h-7 w-7 transition-transform group-hover:scale-110" />
					<CheckCircle2
						class="h-3 w-3 absolute -bottom-1 -right-1 text-green-500"
					/>
				</div>
				<span class="font-bold text-lg text-white">ProofInBio</span>
			</a>
			<div class="flex items-center gap-3">
				<Button variant="ghost" size="sm" href="#how-it-works">How it Works</Button>
				<Button size="sm" onclick={onAuthRequest}>Get Started</Button>
			</div>
		</nav>
	</div>
</header>
