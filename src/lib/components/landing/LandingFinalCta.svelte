<script>
	import { Button } from '$lib/ui/button/index.js';
	import { Card } from '$lib/ui/card/index.js';
	import { ArrowRight } from 'lucide-svelte';

	export let onAuthRequest = () => {};
</script>

<section class="container mx-auto max-w-5xl px-6 py-20 md:py-28">
	<Card class="relative overflow-hidden">
		<div class="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 opacity-10"></div>
		<div class="relative p-12 md:p-16 text-center space-y-6">
			<p class="text-xs font-bold tracking-widest uppercase text-zinc-500">Start Here</p>
			<h2 class="text-4xl md:text-5xl font-bold text-zinc-900">
				Create your first proof-backed gallery
			</h2>
			<p class="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
				Upload a provenance-backed image, generate a proof page, and start sharing a link people can
				verify.
			</p>
			<div class="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
				<Button size="lg" class="group" onclick={onAuthRequest}>
					Start Free
					<ArrowRight class="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
				</Button>
				<Button size="lg" variant="outline" href="/examples">View Demo Proof Page</Button>
			</div>
			<p class="text-sm text-muted-foreground">
				No credit card required • 50 photos free • 2-minute setup
			</p>
		</div>
	</Card>
</section>
