<script>
	const gearBrands = [
		{ name: 'Sony', note: 'Alpha and FX families' },
		{ name: 'Canon', note: 'EOS R professional bodies' },
		{ name: 'Leica', note: 'Native C2PA-enabled models' },
		{ name: 'Nikon', note: 'Authenticity service support' },
		{ name: 'Fujifilm', note: 'GFX and X series support' },
		{ name: 'Google Pixel 10', note: 'Native smartphone momentum' }
	];

	const faqs = [
		{
			question: 'What if I edit in Lightroom?',
			answer:
				'Compatible edits can stay in the provenance trail, so your proof page can show what changed instead of hiding it.'
		},
		{
			question: 'What if a platform strips metadata?',
			answer:
				'The proof page still works because it lives outside the platform and preserves the provenance record in a shareable format.'
		},
		{
			question: 'Can I still share a proof page anywhere?',
			answer:
				'Yes. The point is one link you can use across editorial, licensing, collector, and client workflows.'
		}
	];
</script>

<section class="py-24 relative overflow-hidden" id="supported-devices">
	<div
		class="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.08),_transparent_45%)]"
	></div>

	<div class="container mx-auto max-w-5xl px-6">
		<div class="text-center max-w-3xl mx-auto mb-14">
			<p class="text-xs font-bold tracking-widest uppercase text-zinc-500 mb-4">Supported Gear</p>
			<h2 class="text-4xl md:text-5xl font-bold tracking-tight mb-6">
				Works with the cameras and tools professionals already use
			</h2>
			<p class="text-lg md:text-xl text-muted-foreground leading-relaxed">
				Proof in Bio is built for provenance-backed files from leading camera makers and editing
				workflows, with smartphone momentum now reaching devices like the Google Pixel 10.
			</p>
		</div>

		<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
			{#each gearBrands as brand}
				<div class="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
					<p class="text-lg font-semibold text-foreground">{brand.name}</p>
					<p class="mt-2 text-sm leading-6 text-muted-foreground">{brand.note}</p>
				</div>
			{/each}
		</div>

		<div class="mt-6 text-center">
			<a href="/supported-cameras" class="text-sm font-semibold text-primary hover:text-foreground">
				See the full compatibility list &rarr;
			</a>
		</div>

		<div class="mt-14 rounded-3xl border border-border/60 bg-background p-6 md:p-8">
			<p class="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500 mb-6">Quick Answers</p>
			<div class="grid gap-4 md:grid-cols-3">
				{#each faqs as faq}
					<div class="rounded-2xl border border-border/60 bg-card p-5">
						<h3 class="text-base font-semibold text-foreground">{faq.question}</h3>
						<p class="mt-3 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>
