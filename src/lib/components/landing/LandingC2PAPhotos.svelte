<script>
	import { Camera, WandSparkles, Link2, ShieldCheck } from 'lucide-svelte';
	import LandingVerifiedGallery from '$lib/components/landing/LandingVerifiedGallery.svelte';

	const proofPoints = [
		{
			icon: Camera,
			title: 'Captured on supported gear',
			description:
				'The file starts with a provenance record tied to the camera or device that made it.'
		},
		{
			icon: WandSparkles,
			title: 'Edits are disclosed',
			description:
				'When supported, the proof trail shows what changed instead of pretending the file never moved.'
		},
		{
			icon: ShieldCheck,
			title: 'The chain can stay intact or break',
			description:
				'If the record no longer holds up, the page can label that clearly instead of overclaiming certainty.'
		},
		{
			icon: Link2,
			title: 'The proof page is shareable',
			description:
				'You get a permanent link that survives social uploads, submissions, forwarding, and client handoff.'
		}
	];
</script>

<section class="relative py-24 sm:py-28 bg-background overflow-hidden">
	<div
		class="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
		style="background-image: url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23888%22 fill-opacity=%221%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"
	></div>

	<div class="container mx-auto max-w-5xl px-6 relative">
		<div class="max-w-3xl mx-auto text-center">
			<p class="text-xs font-bold tracking-widest uppercase text-zinc-500 mb-4">
				What Proof Looks Like
			</p>
			<h2 class="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground">
				A proof page turns hidden provenance into something people can actually verify.
			</h2>
			<p class="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
				This is what makes an image provable here: where it came from, what happened to it, whether
				the chain still holds, and a link you can share beyond any one platform.
			</p>
		</div>

		<div class="mt-14 grid gap-5 md:grid-cols-2">
			{#each proofPoints as point}
				<div class="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
					<div class="flex items-start gap-4">
						<div
							class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"
						>
							<svelte:component this={point.icon} class="h-5 w-5" />
						</div>
						<div>
							<h3 class="text-xl font-semibold text-foreground">{point.title}</h3>
							<p class="mt-2 text-sm leading-6 text-muted-foreground">{point.description}</p>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<LandingVerifiedGallery />
</section>
