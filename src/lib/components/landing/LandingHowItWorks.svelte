<script>
	import { Upload, ShieldCheck, FileCheck2, Link2, Check } from 'lucide-svelte';

	const steps = [
		{
			icon: Upload,
			title: 'Upload a provenance-backed image',
			description:
				'Start with a supported camera file or edited export that still carries its record.'
		},
		{
			icon: ShieldCheck,
			title: 'We read and preserve its credentials',
			description:
				'We inspect the file, surface the capture and edit history, and keep that record intact.'
		},
		{
			icon: FileCheck2,
			title: 'We generate a shareable proof page',
			description:
				'The page turns metadata into something clients and editors can actually understand.'
		},
		{
			icon: Link2,
			title: 'You share it anywhere',
			description:
				'Use one proof link across submissions, deliveries, bios, and portfolio conversations.'
		}
	];

	const proofDetails = [
		'Capture device and timestamp',
		'Edit history when supported',
		'Clear verified or unproven status',
		'One link that works even after platforms strip metadata'
	];
</script>

<section id="how-it-works" class="relative py-24 sm:py-32 bg-secondary/10 overflow-hidden">
	<div class="container mx-auto max-w-5xl px-6 relative z-10">
		<div class="text-center max-w-3xl mx-auto mb-16">
			<p class="text-xs font-bold tracking-widest uppercase text-zinc-500 mb-4">How It Works</p>
			<h2 class="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-foreground">
				From provenance-backed file to proof page
			</h2>
			<p class="text-lg md:text-xl text-muted-foreground">
				Send editors, collectors, and clients a single link that proves your work is real without
				relying on any platform's metadata.
			</p>
		</div>

		<div class="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
			<div class="rounded-[2rem] border border-border/60 bg-background p-6 shadow-xl md:p-8">
				<div class="flex items-center justify-between border-b border-border pb-4">
					<div>
						<p class="text-xs font-bold tracking-[0.18em] uppercase text-zinc-500">
							Example Proof Page
						</p>
						<h3 class="mt-2 text-2xl font-bold text-foreground">Mara Levin, Untitled No. 12</h3>
					</div>
					<div
						class="inline-flex items-center gap-2 rounded-full bg-verified/10 px-3 py-1 text-sm font-semibold text-verified"
					>
						<span class="h-2 w-2 rounded-full bg-verified"></span>
						Verified
					</div>
				</div>

				<div class="mt-6 grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
					<div class="overflow-hidden rounded-2xl bg-zinc-100">
						<img
							src="https://images.pexels.com/photos/307008/pexels-photo-307008.jpeg?w=900"
							alt="Example proof page artwork"
							class="h-full w-full object-cover"
						/>
					</div>
					<div class="space-y-4">
						<div class="rounded-2xl border border-border bg-card p-4">
							<p class="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Capture</p>
							<p class="mt-2 text-sm text-foreground">
								Sony A7R V • January 12, 2026 • Original file intact
							</p>
						</div>
						<div class="rounded-2xl border border-border bg-card p-4">
							<p class="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Edits</p>
							<p class="mt-2 text-sm text-foreground">
								Lightroom crop and tonal adjustments disclosed in the chain.
							</p>
						</div>
						<div class="rounded-2xl border border-border bg-card p-4">
							<p class="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
								Shareable proof
							</p>
							<p class="mt-2 text-sm text-foreground">
								A permanent proof page you can send in editorial, licensing, and collector
								conversations.
							</p>
						</div>
						<div
							class="rounded-2xl border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-900"
						>
							If the chain is broken, we label that clearly instead of pretending every image
							passes.
						</div>
					</div>
				</div>
			</div>

			<div class="space-y-4">
				{#each steps as step, index}
					<div class="rounded-2xl border border-border/60 bg-background p-5 shadow-sm">
						<div class="flex items-start gap-4">
							<div
								class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"
							>
								<svelte:component this={step.icon} class="h-5 w-5" />
							</div>
							<div>
								<p class="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
									Step {index + 1}
								</p>
								<h3 class="mt-1 text-xl font-semibold text-foreground">{step.title}</h3>
								<p class="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
							</div>
						</div>
					</div>
				{/each}

				<div class="rounded-2xl border border-border/60 bg-card p-5">
					<p class="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
						What the page shows
					</p>
					<ul class="mt-4 space-y-3">
						{#each proofDetails as detail}
							<li class="flex items-start gap-3 text-sm text-muted-foreground">
								<div
									class="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-verified/10"
								>
									<Check class="h-3 w-3 text-verified" strokeWidth={3} />
								</div>
								<span>{detail}</span>
							</li>
						{/each}
					</ul>
				</div>
			</div>
		</div>
	</div>
</section>
