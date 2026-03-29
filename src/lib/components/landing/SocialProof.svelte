<script>
	import { Card } from '$lib/ui/card/index.js';

	const personas = [
		{
			title: 'Photojournalists',
			description:
				'Need proof that travels with the image when it reaches editors, publications, and review desks.'
		},
		{
			title: 'Fine art photographers',
			description:
				'Need a certificate-of-authenticity layer collectors can inspect without relying on a sales platform.'
		},
		{
			title: 'Documentary and field photographers',
			description: 'Need a record that survives platform stripping, forwarding, and context loss.'
		},
		{
			title: 'Emerging creators',
			description:
				'Need a clean way to show clients and followers that the work is provenance-backed from the start.'
		}
	];
</script>

<section class="bg-muted/50 py-20">
	<div class="container mx-auto max-w-5xl px-6">
		<div class="text-center max-w-3xl mx-auto mb-12">
			<p class="text-xs font-bold tracking-widest uppercase text-zinc-500 mb-4">Who It's For</p>
			<h2 class="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
				Built for photographers whose work has to hold up under scrutiny
			</h2>
			<p class="text-lg text-zinc-500 leading-relaxed">
				Proof in Bio is most useful wherever image credibility affects editorial decisions,
				collector confidence, licensing, or client trust.
			</p>
		</div>

		<div class="grid gap-6 md:grid-cols-2">
			{#each personas as persona}
				<Card class="p-6 space-y-3">
					<p class="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Persona</p>
					<h3 class="text-xl font-semibold text-zinc-900">{persona.title}</h3>
					<p class="text-sm leading-6 text-muted-foreground">{persona.description}</p>
				</Card>
			{/each}
		</div>
	</div>
</section>
