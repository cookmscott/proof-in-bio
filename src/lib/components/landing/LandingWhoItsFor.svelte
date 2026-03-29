<script>
	const audiences = [
		{
			title: 'Photographers',
			description:
				'Show editors, clients, and collectors that your image came from a real camera and kept its proof trail.'
		},
		{
			title: 'Journalists',
			description:
				'Share source images with capture history attached so authenticity is easier to verify before publication.'
		},
		{
			title: 'Artists',
			description:
				'Give your portfolio a proof layer that helps viewers separate documented process from synthetic output.'
		},
		{
			title: 'Studios',
			description:
				'Use one proof link across submissions, deliveries, licensing, and internal review workflows.'
		}
	];
</script>

<section class="bg-background py-24">
	<div class="container mx-auto max-w-5xl px-6">
		<div class="mx-auto mb-10 max-w-3xl text-center">
			<p class="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">
				Who it&apos;s for
			</p>
			<h2 class="text-balance text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
				For people who need proof to travel with the work.
			</h2>
			<p class="mx-auto mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
				Proof in Bio is built for image-driven work where trust matters before anyone asks for it.
			</p>
		</div>

		<div class="overflow-hidden rounded-2xl bg-border p-[2px]">
			<div class="grid gap-[2px] bg-border md:grid-cols-2">
				{#each audiences as audience (audience.title)}
					<div class="bg-background px-7 py-7">
						<p class="text-xl font-medium tracking-tight text-foreground">
							{audience.title}
						</p>
						<p class="mt-2 text-base leading-7 text-muted-foreground">
							{audience.description}
						</p>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>
