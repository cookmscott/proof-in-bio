<!-- 
  Svelte 5 Component: PolaroidScroll

  This component uses GSAP and the ScrollTrigger plugin to create a "sticky"
  gallery of polaroid-style images that animate into a stack as the user scrolls.
-->
<script>
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

	gsap.registerPlugin(ScrollTrigger);

	const items = [
		{
			src: 'https://images.unsplash.com/photo-1532715088550-62f09305f765?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1161&q=80',
			alt: 'Traces in the snow',
			caption: 'Proven and verified...'
		},
		{
			src: 'https://images.unsplash.com/photo-1571333248844-316a70fb180e?crop=entropy&cs=srgb&fm=jpg&q=85',
			alt: 'Faded tracks',
			caption: "Minimal edits... "
		},
		{
			src: 'https://images.unsplash.com/photo-1516370873344-fb7c61054fa9?crop=entropy&cs=srgb&fm=jpg&q=85',
			alt: 'Things left behind',
			caption: '...This is real.'
		}
	];

	let mainContainer;
	let polaroidElements = [];
	let backgroundWords = [];

	// Utility: wait for all images to finish (sizes matter for pinning)
	const waitForImages = (container) =>
		Promise.all(
			Array.from(container.querySelectorAll('img')).map((img) =>
				img.complete && img.naturalWidth
					? Promise.resolve()
					: new Promise((res) => {
							img.addEventListener('load', res, { once: true });
							img.addEventListener('error', res, { once: true });
						})
			)
		);

	onMount(async () => {
		const ctx = gsap.context(async () => {
			await waitForImages(mainContainer);

			// Layering & initial states
			polaroidElements.forEach((el, i) => {
				gsap.set(el, { position: 'absolute', inset: 0, zIndex: 10 + i });
			});

			// CARD #1: already there, no animation
			const first = polaroidElements[0];
			gsap.set(first, {
				y: 0,
				opacity: 1,
				rotation: -4 // subtle tilt if you want; change or remove
			});

			// CARDS #2 and #3: start below, fade in, land on top of #1
			const rest = polaroidElements.slice(1);
			gsap.set(rest, {
				y: '100vh',
				opacity: 1
			});

			const existing = ScrollTrigger.getById('polaroidScroll');
			if (existing) existing.kill();

			// Build scroll-driven timeline
			const tl = gsap.timeline({
				defaults: { ease: 'power1.out' },
				scrollTrigger: {
					id: 'polaroidScroll',
					trigger: mainContainer,
					start: 'top top', // when this section hits the top
					end: '+=300%', // how long the stacking lasts; tweak 100–180%
					scrub: true,
					pin: true,
					anticipatePin: 1, // allow normal page flow; remove blank jumps
					pinSpacing: 'bottom'
				}
			});

			// --- START OF FIX ---

			// 1. SET initial state for background words
			// We do this *before* adding them to the timeline
			backgroundWords.forEach((word) => {
				gsap.set(word, { y: '40vh' });
			});

			// 2. ADD background word animations TO THE MAIN TIMELINE
			// Remove their independent scrollTriggers
			backgroundWords.forEach((word, i) => {
				tl.to(
					word,
					{
						y: `-${20 + i * 15}vh`,
						ease: 'none' // 'none' ease is best for a linear scrub
					},
					0 // Add this animation at the very start (0) of the timeline
				);
			});

			// 3. ADD your card animations TO THE SAME TIMELINE
			if (rest[0]) {
				tl.to(
					rest[0],
					{
						y: 0,
						opacity: 1,
						rotation: 3
					},
					0 // Also starts at the beginning
				); // starts at the beginning of the scroll range
			}

			// Animate card #3 into place later in the scroll range
			if (rest[1]) {
				tl.to(
					rest[1],
					{
						y: 0,
						opacity: 1,
						rotation: -7
					},
					0.5 // Starts halfway through the timeline
				); // halfway through; adjust to change spacing
			}

			// --- END OF FIX ---

			// Recalculate on resize / font swap
			ScrollTrigger.refresh();
		}, mainContainer);

		return () => ctx.revert(); // Cleanup GSAP context on component unmount
	});
</script>

<section id="polaroidScroll" class="bg-background p-0">
<div class="polaroid-container" bind:this={mainContainer}>
	<div class="background-text-container">
		<div class="background-word" bind:this={backgroundWords[0]}>TRUSTWORTHY</div>
		<div class="background-word" bind:this={backgroundWords[1]}>ORIGINAL</div>
		<div class="background-word" bind:this={backgroundWords[2]}>AUTHENTIC</div>
		<div class="background-word" bind:this={backgroundWords[3]}>VERIFIED</div>
	</div>

	<div class="polaroid-stack">
		{#each items as item, i (item.src)}
			<div class="polaroid" bind:this={polaroidElements[i]}>
				<div class="card" class:last-card={i === items.length - 1}>
					<img src={item.src} alt={item.alt} />
					<p>{item.caption}</p>
				</div>
			</div>
		{/each}
	</div>
</div>
</section>

<style>
	.polaroid-container {
		position: relative;
		width: 100%;
		height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
		overflow: hidden !important;
		font-family: 'Caveat', sans-serif;
	}
	.background-text-container {
		position: absolute;
		inset: 0;
		z-index: 0;
		display: flex;
		flex-direction: column;
		justify-content: space-around;
		align-items: center;
		overflow: hidden;
		pointer-events: none;
	}
	.background-word {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
			'Open Sans', 'Helvetica Neue', sans-serif;
		font-size: clamp(6rem, 18vw, 16rem);
		font-weight: 900; /* extrabold */
		opacity: 1.0;
		will-change: transform;
	}
	.polaroid-stack {
		position: relative;
		width: min(420px, 80vw);
		aspect-ratio: 4 / 5; /* consistent card box, avoids relayout jumps */
		display: grid;
		place-items: center;
		color: black;
	}
	.polaroid {
		grid-area: 1 / 1; /* Stack all polaroids in the same grid cell */
		/* Positioned absolutely via gsap.set */
		will-change: transform, opacity;
		filter: drop-shadow(0 10px 25px rgba(0, 0, 0, 0.18));
	}
	.card {
		background: #fff;
		height: 100%;
		padding: 5%;
		border: 3px solid black;
		display: flex;
		flex-direction: column;
	}
	img {
		display: block;
		width: 100%;
		height: auto;
		object-fit: cover;
		aspect-ratio: 1 / 1;
		border: 2px solid #444;
		/* filter: grayscale(100%); */
	}
	.card p {
		margin-top: 1rem;
		padding-bottom: 0.5rem;
		text-align: center;
		font-size: clamp(1.1rem, 3.8vw, 1.5rem);
	}
</style>