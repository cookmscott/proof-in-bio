<script>
	import { Briefcase, Newspaper, User, ShieldCheck, ArrowRight } from 'lucide-svelte';
	import { Button } from '$lib/ui/button/index.js';
</script>

<div class="bg-background py-20 sm:py-28">
	<div class="container mx-auto max-w-6xl px-6">
		<!-- Heading -->
		<div class="text-center max-w-3xl mx-auto">
			<div class="inline-flex items-center gap-2 text-primary">
				<ShieldCheck class="h-5 w-5" />
				<span class="font-semibold">Essential for High-Stakes Work</span>
			</div>
			<h2 class="mt-4 text-3xl md:text-4xl font-bold text-foreground">
				Where Authenticity is Non-Negotiable
			</h2>
			<p class="mt-4 text-lg text-muted-foreground">
				Proof in Bio provides an immutable, verifiable record, ensuring your work meets the rigorous
				standards of professional industries where trust is paramount.
			</p>
		</div>

		<!-- Use cases grid -->
		<div class="mt-24 grid md:grid-cols-3 gap-x-12 gap-y-16">
			<!-- Commercial / Brand Work -->
			<div class="flex flex-col space-y-4 text-center">
				<div class="relative">
					<div
						class="absolute -top-8 left-1/2 z-10 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-2xl border bg-card"
					>
						<Briefcase class="h-8 w-8 text-primary" />
					</div>
					<img
						src="https://images.pexels.com/photos/30797176/pexels-photo-30797176.jpeg?width=400"
						alt="Commercial product photography setup"
						class="h-56 w-full rounded-lg object-cover transition-transform hover:scale-105"
					/>
				</div>
				<div class="pt-4">
					<h3 class="text-xl font-semibold text-foreground">Commercial & Brand Work</h3>
					<p class="mt-2 text-muted-foreground">
						Verified commercial work — show clients it’s real.
					</p>
				</div>
			</div>

			<!-- Documentary / Journalism -->
			<div class="flex flex-col space-y-4 text-center">
				<div class="relative">
					<div
						class="absolute -top-8 left-1/2 z-10 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-2xl border bg-card"
					>
						<Newspaper class="h-8 w-8 text-primary" />
					</div>
					<img
						src="https://images.pexels.com/photos/13237007/pexels-photo-13237007.jpeg?w=400"
						alt="Journalist capturing a protest event"
						class="h-56 w-full rounded-lg object-cover transition-transform hover:scale-105"
					/>
				</div>
				<div class="pt-4">
					<h3 class="text-xl font-semibold text-foreground">Documentary & Journalism</h3>
					<p class="mt-2 text-muted-foreground">
						Truth in imagery — preserve trust in real events.
					</p>
				</div>
			</div>

			<!-- Portrait / Lifestyle -->
			<div class="flex flex-col space-y-4 text-center">
				<div class="relative">
					<div
						class="absolute -top-8 left-1/2 z-10 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-2xl border bg-card"
					>
						<User class="h-8 w-8 text-primary" />
					</div>
					<img
						src="/mrbeast.webp"
						alt="Authentic lifestyle portrait"
						class="h-56 w-full rounded-lg object-cover transition-transform hover:scale-105"
					/>
				</div>
				<div class="pt-4">
					<h3 class="text-xl font-semibold text-foreground">Portrait & Creator Identity</h3>
					<p class="mt-2 text-muted-foreground">
						Human portraits only — verified by capture, not creation.
					</p>
				</div>
			</div>
		</div>

		<div class="mt-24 text-center">
			<div
				class="relative mx-auto max-w-4xl rounded-xl border bg-muted/40 p-8 shadow-sm"
			>
				<h3 class="text-2xl font-bold tracking-tight text-foreground">
					Elevate the Integrity of Your Portfolio
				</h3>
				<p class="mx-auto mt-3 max-w-2xl text-muted-foreground">
				By leveraging C2PA technology, every photo's provenance is secured, making it a trusted
					asset for news organizations, legal firms, and historical archives.
				</p>
				<div class="mt-6">
					<Button size="lg" href="#how-it-works" class="group">
						Integrate Proof in Bio
						<ArrowRight class="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
					</Button>
				</div>
			</div>
		</div>
	</div>
</div>
