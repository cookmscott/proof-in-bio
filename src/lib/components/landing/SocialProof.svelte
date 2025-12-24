<script>
	import { Card } from '$lib/ui/card/index.js';
	import { Zap } from 'lucide-svelte';
</script>

<section class="bg-muted/50 py-20">
	<div class="container mx-auto max-w-6xl px-6">
		<div class="text-center space-y-4 mb-12">
			<h2 class="text-3xl md:text-4xl font-bold">For creators who value authenticity</h2>
		</div>

		<div class="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
			<Card class="p-6 space-y-4">
				<div class="flex gap-1">
					{#each Array.from({ length: 5 }, (_, i) => i) as i (i)}
						<Zap class="h-4 w-4 fill-amber-400 text-amber-400" />
					{/each}
				</div>
				<p class="text-sm">
					"Finally, a way to show my photography is actually mine. Game changer for client
					trust."
				</p>
				<div class="flex items-center gap-3">
					<img
						src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
						alt="Sarah Chen"
						class="h-8 w-8 rounded-full object-cover"
					/>
					<div>
						<p class="text-sm font-medium">Sarah Chen</p>
						<p class="text-xs text-muted-foreground">@sarahcaptures</p>
					</div>
				</div>
			</Card>

			<Card class="p-6 space-y-4">
				<div class="flex gap-1">
					{#each Array.from({ length: 5 }, (_, i) => i) as i (i)}
						<Zap class="h-4 w-4 fill-amber-400 text-amber-400" />
					{/each}
				</div>
				<p class="text-sm">
					"My illustrations stand out now. Collectors know they're getting authentic human
					art."
				</p>
				<div class="flex items-center gap-3">
					<img
						src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
						alt="Marcus Rodriguez"
						class="h-8 w-8 rounded-full object-cover"
					/>
					<div>
						<p class="text-sm font-medium">Marcus Rodriguez</p>
						<p class="text-xs text-muted-foreground">@marcusdraws</p>
					</div>
				</div>
			</Card>

			<Card class="p-6 space-y-4">
				<div class="flex gap-1">
					{#each Array.from({ length: 5 }, (_, i) => i) as i (i)}
						<Zap class="h-4 w-4 fill-amber-400 text-amber-400" />
					{/each}
				</div>
				<p class="text-sm">
					"Proof in Bio = instant credibility. My engagement went through the roof."
				</p>
				<div class="flex items-center gap-3">
					<img
						src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop"
						alt="Alex Kim"
						class="h-8 w-8 rounded-full object-cover"
					/>
					<div>
						<p class="text-sm font-medium">Alex Kim</p>
						<p class="text-xs text-muted-foreground">@alexshootsfilm</p>
					</div>
				</div>
			</Card>
		</div>
	</div>
</section>
