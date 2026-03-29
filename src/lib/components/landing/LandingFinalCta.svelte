<script>
	import { Button } from '$lib/ui/button/index.js';
	import { Card } from '$lib/ui/card/index.js';
	import { ArrowRight } from 'lucide-svelte';

	export let onAuthRequest = () => {};
</script>

<section class="container mx-auto max-w-5xl px-6 py-20 md:py-28">
	<Card class="relative overflow-hidden">
		<div class="absolute inset-0 bg-[#fefcf6] dark:bg-accent"></div>
		<div class="relative p-12 md:p-16 text-center space-y-6">
			<h2
				class="max-w-6xl text-balance font-serif text-4xl font-semibold leading-[0.9] tracking-[-0.04em] text-foreground"
			>
				Start with one photo.<br />Share proof forever.
			</h2>
			<p class="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
				Join thousands of creators building proof with every upload. Free to start, powerful
				forever.
			</p>
			<div class="flex flex-col sm:flex-row gap-4 justify-center pt-4">
				<Button size="lg" class="group" onclick={onAuthRequest}>
					Create Your Gallery
					<ArrowRight class="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
				</Button>
				<Button size="lg" variant="outline">Learn About C2PA</Button>
			</div>
			<p class="text-sm text-muted-foreground">
				No credit card required • 50 photos free • 2-minute setup
			</p>
		</div>
	</Card>
</section>
