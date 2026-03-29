<script>
	import { ArrowRight } from 'lucide-svelte';
	import { Button } from '$lib/ui/button/index.js';

	let newsLogos = [
		'/landing/carousel_news/abcnews.png',
		'/landing/carousel_news/afp.png',
		'/landing/carousel_news/associatedpress.png',
		'/landing/carousel_news/bbcnews.png',
		'/landing/carousel_news/bloomberg.png',
		'/landing/carousel_news/cbsnews.png',
		'/landing/carousel_news/cnn.png',
		'/landing/carousel_news/foxnewschannel.png',
		'/landing/carousel_news/france24.png',
		'/landing/carousel_news/nbcnews.png',
		'/landing/carousel_news/npr.png',
		'/landing/carousel_news/pbs.png',
		'/landing/carousel_news/reuters.png',
		'/landing/carousel_news/theguardian.png'
	];

	const situations = [
		'Editorial submissions',
		'Collector sales',
		'Licensing conversations',
		'Documentary work',
		'Client deliveries'
	];

	function shuffle(array) {
		let currentIndex = array.length;
		let randomIndex;

		while (currentIndex > 0) {
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex--;
			[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
		}

		return array;
	}

	newsLogos = shuffle(newsLogos);
	const row1 = [...newsLogos, ...newsLogos, ...newsLogos];
</script>

<section class="bg-zinc-50 dark:bg-zinc-900 py-20 border-y border-border/40 overflow-hidden">
	<div class="container mx-auto max-w-5xl px-6">
		<div class="text-center max-w-3xl mx-auto">
			<p class="text-xs font-bold tracking-widest uppercase text-zinc-500 mb-4">
				When Proof Matters
			</p>
			<h2 class="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-4">
				Trust is fragile when your work has to travel.
			</h2>
			<p class="text-zinc-500 text-base md:text-lg leading-relaxed">
				The same verification standard used by newsrooms and wire services is becoming essential
				where image credibility affects publication, licensing, and sales.
			</p>
			<p class="mt-4 text-sm md:text-base text-zinc-500 leading-relaxed">
				It doesn't magically prove truth. It gives people something better than trust-me: a
				verifiable provenance trail.
			</p>
		</div>

		<div class="mt-10 grid gap-4 md:grid-cols-5">
			{#each situations as situation}
				<div
					class="rounded-2xl border border-border/60 bg-background px-4 py-4 text-center text-sm font-medium text-foreground shadow-sm"
				>
					{situation}
				</div>
			{/each}
		</div>

		<div
			class="mt-8 rounded-2xl border border-amber-300/40 bg-amber-50 px-5 py-4 text-sm text-amber-950"
		>
			Major platforms are already flagging some real edited photos as AI-generated. Your proof page
			lives outside their systems.
		</div>

		<div class="mt-10">
			<div
				class="relative flex overflow-hidden w-full select-none rounded-3xl border border-border/50 bg-background/60 py-6"
			>
				<div
					class="flex gap-4 animate-marquee whitespace-nowrap items-center will-change-transform"
					style="animation-duration: 80s;"
				>
					{#each row1 as url}
						<div class="h-16 w-32 md:h-20 md:w-40 flex items-center justify-center p-4">
							<img
								src={url}
								alt="News outlet logo"
								loading="lazy"
								class="max-w-full max-h-full object-contain"
							/>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<div class="mt-8 text-center">
			<Button variant="outline" href="#supported-devices" class="group rounded-full bg-background">
				Check Supported Gear
				<ArrowRight class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
			</Button>
		</div>
	</div>
</section>

<style>
	.animate-marquee {
		animation: marquee 60s linear infinite;
	}

	@keyframes marquee {
		0% {
			transform: translateX(0);
		}
		100% {
			transform: translateX(-33.33%);
		}
	}

	.will-change-transform {
		will-change: transform;
	}
</style>
