<script>
	import { Badge } from '$lib/ui/badge';
	import { Separator } from '$lib/ui/separator';
	import { Button } from '$lib/ui/button';

	const embedScale = 0.56;
	const embedSize = `${100 / embedScale}%`;

	const steps = [
		{
			title: 'Upload a provenance-backed image',
			description:
				'Start with a supported camera file or edited export that still carries its content credentials.'
		},
		{
			title: 'We read and preserve its credentials',
			description:
				'Proof in Bio inspects the file, surfaces the capture and edit history, and keeps that record attached.'
		},
		{
			title: 'We generate a shareable proof page',
			description:
				'The page turns metadata into a human-readable record with clear verification status and provenance context.'
		},
		{
			title: 'You share it anywhere',
			description:
				'Use one proof link across bios, portfolios, submissions, client deliveries, and collector conversations.'
		}
	];
</script>

<section id="how-it-works" class="bg-background py-24">
	<div class="container mx-auto max-w-5xl px-6">
		<div class="mx-auto mb-12 max-w-3xl text-center sm:mb-14">
			<p class="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">How it works</p>
			<h2 class="max-w-6xl text-balance font-serif text-4xl font-semibold leading-[0.9] tracking-[-0.04em] text-foreground">
				How a photo becomes proof.
			</h2>
			<p class="mx-auto mt-4 max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
				One link that proves your work is real, with the capture and edit record intact.
			</p>
		</div>

		<div class="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:gap-10">
			<div class="space-y-5">
				<div class="flex items-start justify-between gap-4">
					<div>
						<p class="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
							Example proof page
						</p>
						<Button variant="link" class="mt-4 text-2xl font-semibold tracking-tight text-foreground">@cookmscott</Button>
					</div>
				</div>
				<Separator />

				<div class="rounded-[1.5rem] bg-muted/30 px-4 py-6 sm:px-6">
					<div class="flex justify-center">
						<div
							class="w-full max-w-[300px] rounded-[2.2rem] bg-zinc-950 p-2.5 shadow-xl shadow-black/10"
						>
							<div class="flex justify-center pb-2.5">
								<div class="h-1.5 w-16 rounded-full bg-zinc-700"></div>
							</div>
							<div class="h-[540px] overflow-hidden rounded-[1.7rem] bg-background">
								<iframe
									src="/cookmscott"
									title="Example proof page"
									class="block border-0 bg-background"
									style={`width: ${embedSize}; height: ${embedSize}; transform: scale(${embedScale}); transform-origin: top left;`}
									scrolling="no"
								></iframe>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div>
				<div class="space-y-1">
					<p class="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
						Verification timeline
					</p>
					<p class="mt-4 text-2xl font-semibold tracking-tight text-foreground">
						From file to shareable proof.
					</p>
				</div>

				<div class="mt-10">
					{#each steps as step, index (step.title)}
						<div class="relative grid grid-cols-[3.25rem_minmax(0,1fr)] gap-4 sm:gap-5">
							<div class="relative flex justify-center">
								{#if index < steps.length - 1}
									<div
										class="absolute top-11 bottom-[-1.5rem] left-1/2 w-px -translate-x-1/2 bg-border"
									></div>
								{/if}
								<div
									class="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background text-base font-semibold text-foreground"
								>
									{index + 1}
								</div>
							</div>

							<div class={`pb-8 ${index === steps.length - 1 ? 'pb-0' : ''}`}>
								<div class="min-w-0 pt-1">
									<p
										class="text-base font-semibold leading-tight text-foreground sm:text-[1.05rem]"
									>
										{step.title}
									</p>
									<p class="mt-2 text-base leading-8 text-muted-foreground">
										{step.description}
									</p>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</section>
