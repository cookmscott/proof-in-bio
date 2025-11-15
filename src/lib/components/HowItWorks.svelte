<script>
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
	import { ShieldCheck, Upload, Link2 } from 'lucide-svelte';
	import DetectiveRobot from './DetectiveRobot.svelte';

	gsap.registerPlugin(ScrollTrigger);

	const steps = [
		{
			icon: Upload,
			title: '1. Upload with C2PA',
			description: 'Drop in photos straight from your camera or any C2PA-enabled editing tool.',
			image: 'https://images.pexels.com/photos/3762375/pexels-photo-3762375.jpeg?w=800'
		},
		{
			icon: ShieldCheck,
			title: '2. Instant verification',
			description: "We verify the cryptographic proof. If it’s not authentic, it doesn’t go live.",
			image: 'https://images.pexels.com/photos/8090132/pexels-photo-8090132.jpeg?w=800'
		},
		{
			icon: Link2,
			title: '3. Share your link',
			description: 'Get a clean, verified gallery URL you can drop in any bio or portfolio.',
			image: 'https://images.pexels.com/photos/1540338/pexels-photo-1540338.jpeg?w=800'
		}
	];

	let mainContainer;
	let textElements = [];
	let visualElements = [];

	onMount(() => {
		const ctx = gsap.context(() => {
			// First step visible by default
			if (textElements[0] && visualElements[0]) {
				gsap.set(textElements[0], { opacity: 1, y: 0 });
				gsap.set(visualElements[0], { opacity: 1, y: 0, scale: 1 });
			}

			// Remaining steps start hidden
			if (steps.length > 1) {
				gsap.set(textElements.slice(1), { opacity: 0, y: 24 });
				gsap.set(visualElements.slice(1), { opacity: 0, y: 24, scale: 0.97 });
			}

			const existing = ScrollTrigger.getById('how-it-works');
			if (existing) existing.kill();

			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: mainContainer,
					start: 'top top',
					end: '+=180%',
					pin: true,
					pinSpacing: true,
					scrub: true,
					// --- START OF FIX ---
					snap: {
						snapTo: (value) => {
							const labels = Object.values(tl.labels);
							const stepProgress = value * (labels.length - 1);
							const snappedStep = Math.round(stepProgress);
							const snappedProgress = snappedStep / (labels.length - 1);
							return snappedProgress;
						},
						duration: { min: 0.2, max: 1 },
						ease: 'power1.out'
					}
					// markers: true
				},
				defaults: {
					// --- END OF FIX ---
					ease: 'power2.out',
					duration: 0.45
				}
			});

			// Label for first state (step 1)
			tl.addLabel('step0');

			// Transitions: 1 → 2 → 3
			for (let i = 1; i < steps.length; i++) {
				tl.to(
					[textElements[i - 1], visualElements[i - 1]],
					{ opacity: 0, y: -24, scale: 0.96, stagger: 0.04 }
				)
					.fromTo(
						[textElements[i], visualElements[i]],
						{ opacity: 0, y: 24, scale: 0.97 },
						{ opacity: 1, y: 0, scale: 1, stagger: 0.04 },
						'>-0.1'
					)
					.addLabel(`step${i}`);
			}
		}, mainContainer);

		return () => ctx.revert();
	});
</script>

<section id="how-it-works" class="relative">
	<div class="container mx-auto max-w-5xl px-6 pt-20 md:pt-28 text-center">
		<h2 class="text-4xl md:text-5xl font-semibold tracking-tight">
			Dead simple. Seriously powerful.
		</h2>
		<p class="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mt-4">
			Go from raw photos to a verified, shareable gallery link in under a minute.
		</p>
	</div>

	<div class="how-it-works-container" bind:this={mainContainer}>
		<div class="grid-container">
			<!-- Left Column: Text Content -->
			<div class="text-stack" aria-live="polite">
				{#each steps as step, i (step.title)}
					<div class="step-text" bind:this={textElements[i]}>
						<p class="text-sm uppercase tracking-[0.18em] text-muted-foreground mb-3">
							How it works
						</p>
						<h3 class="text-2xl md:text-3xl font-semibold leading-tight">
							{step.title}
						</h3>
						<p class="text-muted-foreground mt-3 text-base md:text-lg max-w-md">
							{step.description}
						</p>
					</div>
				{/each}
			</div>

			<!-- Right Column: Visuals (image + icon) -->
			<div class="visual-stack">
				{#each steps as step, i (step.title)}
					<div class="step-visual" bind:this={visualElements[i]}>
						<div class="visual-shell">
							<figure class="visual-card">
								<img
									src={step.image}
									alt={step.title}
									loading="lazy"
									class="visual-image"
								/>
								<div class="visual-gradient"></div>
							</figure>
							{#if i === 1}
								<DetectiveRobot />
							{/if}

							<div class="visual-meta">
								<div class="visual-pill">
									<span class="pill-dot" aria-hidden="true"></span>
									<span class="pill-text">C2PA-ready</span>
								</div>
							</div>

							<div class="icon-badge">
								<div
									class="flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-background/90 border border-border/60"
								>
									<svelte:component
										this={step.icon}
										class="h-7 w-7 md:h-8 md:w-8 text-primary"
									/>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>

<style>
	.how-it-works-container {
		position: relative;
		width: 100%;
		height: 100vh;
		display: flex;
		align-items: center;
	}

	.grid-container {
		display: grid;
		grid-template-columns: minmax(0, 1.15fr) minmax(0, 1.1fr);
		align-items: center;
		height: 100%;
		max-width: 1100px;
		margin: 0 auto;
		padding: 0 1.5rem;
		gap: 3.5rem;
	}

	.text-stack,
	.visual-stack {
		display: grid;
		position: relative;
		padding-block: 2rem; /* Add vertical space for animations */
		place-items: center; /* This can come after padding */
	}

	.step-text,
	.step-visual {
		grid-area: 1 / 1;
		will-change: opacity, transform;
		width: 100%;
	}

	.step-text {
		text-align: left;
	}

	.visual-stack {
		display: grid;
		place-items: center;
	}

	.visual-shell {
		position: relative;
		width: 100%;
		max-width: 420px;
	}

	/* Image card (no box shadow) */

	.visual-card {
		position: relative;
		width: 100%;
		aspect-ratio: 4 / 4;
		border-radius: 1.5rem;
		overflow: hidden;
		background: radial-gradient(circle at top left, rgba(255, 255, 255, 0.1), transparent),
			color-mix(in oklab, var(--background, #020617) 90%, #000 10%);
		border: 1px solid rgba(148, 163, 184, 0.16);
	}

	.visual-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transform: scale(1.02);
	}

	.visual-gradient {
		position: absolute;
		inset: 0;
		background:
			linear-gradient(to top, rgba(15, 23, 42, 0.85), transparent 45%),
			radial-gradient(circle at top left, rgba(248, 250, 252, 0.3), transparent 55%);
		mix-blend-mode: multiply;
		pointer-events: none;
	}

	.visual-meta {
		position: absolute;
		left: 1.5rem;
		bottom: 1.5rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.visual-pill {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.35rem 0.75rem;
		border-radius: 999px;
		background: rgba(15, 23, 42, 0.8);
		border: 1px solid rgba(148, 163, 184, 0.6);
		backdrop-filter: blur(10px);
	}

	.pill-dot {
		width: 0.45rem;
		height: 0.45rem;
		border-radius: 999px;
		background: radial-gradient(circle, var(--primary, #f97316), transparent);
		box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.25);
	}

	.pill-text {
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.16em;
		color: rgb(226, 232, 240);
		white-space: nowrap;
	}

	.icon-badge {
		position: absolute;
		right: 1.5rem;
		top: 1.5rem;
	}

	.icon-badge::before {
		content: '';
		position: absolute;
		inset: -18px;
		border-radius: 999px;
		border: 1px dashed color-mix(in oklab, currentColor 10%, transparent);
		opacity: 0.5;
	}

	@media (max-width: 900px) {
		.grid-container {
			grid-template-columns: 1fr;
			gap: 2.75rem;
			padding-inline: 1.5rem;
		}

		.text-stack {
			grid-row: 2;
		}

		.visual-stack {
			grid-row: 1;
		}

		.step-text {
			text-align: center;
		}

		.step-text p {
			margin-left: auto;
			margin-right: auto;
		}

		.visual-shell {
			max-width: 360px;
			margin-inline: auto;
		}
	}

	@media (max-width: 640px) {
		.how-it-works-container {
			height: 90vh;
		}

		.visual-shell {
			max-width: 320px;
			border-radius: 1.25rem;
		}
	}
</style>
