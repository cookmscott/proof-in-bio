<section class="min-h-screen bg-background text-foreground">
	<div class="container mx-auto max-w-4xl px-6 py-16">
		<div class="max-w-2xl">
			<p class="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Demo Proof Page</p>
			<h1 class="mt-4 text-4xl md:text-5xl font-bold tracking-tight">
				Example provenance-backed proof page
			</h1>
			<p class="mt-4 text-lg text-muted-foreground leading-8">
				This is a static demo showing the kind of information Proof in Bio can surface when an image
				carries a supported provenance trail.
			</p>
		</div>

		<div class="mt-12 rounded-[2rem] border border-border/60 bg-card p-6 shadow-xl md:p-8">
			<div
				class="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-start md:justify-between"
			>
				<div>
					<p class="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Proof status</p>
					<h2 class="mt-2 text-3xl font-bold text-foreground">Verified provenance trail</h2>
					<p class="mt-3 text-sm leading-6 text-muted-foreground">
						Mara Levin • Untitled No. 12 • Shared for collector review
					</p>
				</div>
				<div
					class="inline-flex items-center gap-2 rounded-full bg-verified/10 px-4 py-2 text-sm font-semibold text-verified"
				>
					<span class="h-2 w-2 rounded-full bg-verified"></span>
					Verified
				</div>
			</div>

			<div class="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
				<div class="overflow-hidden rounded-2xl bg-zinc-100">
					<img
						src="https://images.pexels.com/photos/307008/pexels-photo-307008.jpeg?w=1200"
						alt="Example proof page preview"
						class="h-full w-full object-cover"
					/>
				</div>
				<div class="space-y-4">
					<div class="rounded-2xl border border-border bg-background p-4">
						<p class="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Capture</p>
						<p class="mt-2 text-sm text-foreground">
							Sony A7R V • January 12, 2026 • Original file intact
						</p>
					</div>
					<div class="rounded-2xl border border-border bg-background p-4">
						<p class="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Edit history</p>
						<p class="mt-2 text-sm text-foreground">
							Lightroom crop and tonal adjustment disclosed in the chain.
						</p>
					</div>
					<div class="rounded-2xl border border-border bg-background p-4">
						<p class="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Use case</p>
						<p class="mt-2 text-sm text-foreground">
							Shared with an editor, collector, or licensing client as a proof link.
						</p>
					</div>
					<div
						class="rounded-2xl border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-900"
					>
						If the provenance trail breaks, the page can show that clearly rather than overstate
						certainty.
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
