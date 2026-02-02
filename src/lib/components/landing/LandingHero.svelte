<script>
	import { Button } from '$lib/ui/button/index.js';
	import { ArrowRight, CheckCircle } from 'lucide-svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	export let onAuthRequest = () => {};

	function handleCtaClick() {
		if ($page.data.session) {
			const username = $page.data.session.user?.user_metadata?.username;
			goto(username ? `/${username}` : '/profile');
		} else {
			onAuthRequest();
		}
	}

	let cardElement;

	onMount(() => {
		setTimeout(() => {
			if (cardElement) {
				cardElement.classList.add('animate-sequence');
			}
		}, 500);
	});
</script>

<div class="container mx-auto max-w-7xl px-6">
	<section class="my-8 rounded-2xl overflow-hidden shadow-lg bg-white">
		<div class="md:grid md:grid-cols-2 md:h-[450px]">
			<!-- Text content on the left -->
			<div
				class="p-8 md:p-12 flex flex-col justify-center text-center md:text-left bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50"
			>
				<div class="space-y-5 max-w-md mx-auto md:mx-0">
					<p class="text-lg font-medium tracking-widest uppercase text-stone-600">
						For Human Creators
					</p>
					<h1 class="text-4xl md:text-5xl font-bold tracking-tight text-balance text-gray-900">
						Made by people, not prompts.
					</h1>
					<p class="text-lg text-gray-600 text-balance">
						Stop the AI-confusion. Create a verified gallery to show your followers that your perspective, your eye, and your life are real.
					</p>
					<div class="flex justify-center md:justify-start gap-4 pt-4">
						<Button size="lg" class="group text-white font-bold" onclick={handleCtaClick}>
							Create Your Verified Gallery
							<ArrowRight
								class="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
							/>
						</Button>
					</div>
				</div>
			</div>
			<!-- Image on the right -->
			<div 
				bind:this={cardElement}
				class="h-[300px] md:h-full relative overflow-hidden bg-gray-900 group"
				style="--ease-scan: cubic-bezier(0.4, 0, 0.2, 1); --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1); --scan-duration: 2.0s; --perimeter-duration: 0.7s;"
			>
				<!-- Rotating Border -->
				<div class="rotating-border z-30 pointer-events-none"></div>

				<!-- Image -->
				<img
					src="https://images.pexels.com/photos/9909233/pexels-photo-9909233.jpeg"
					alt="Person standing on a rock looking out over a misty mountain range"
					class="w-full h-full object-cover object-center opacity-90"
				/>

				<!-- Gradient Overlay -->
				<div class="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent z-10 pointer-events-none"></div>

				<!-- Scanner Beam -->
				<div class="scanner-beam z-20 pointer-events-none"></div>

				<!-- Verified Badge & Attribution -->
				<div class="verified-info absolute bottom-0 left-0 w-full p-8 opacity-0 z-30 pointer-events-none">
					<div class="flex items-center gap-2 mb-2">
						<div class="h-px w-8 bg-emerald-500/50"></div>
						<p class="text-[10px] font-bold tracking-[0.2em] text-emerald-400 uppercase">Verified</p>
					</div>
					<h2 class="text-2xl font-bold text-white tracking-tight leading-none">Mathias Reding</h2>
					<p class="text-gray-300 text-xs mt-1 font-light">Photographer</p>
				</div>

				<!-- Status Indicator -->
				<div class="verified-check absolute top-5 right-5 opacity-0 z-30 pointer-events-none">
					<div class="bg-green-500 text-white p-1.5 rounded-full shadow-lg">
						<CheckCircle class="h-5 w-5" />
					</div>
				</div>
			</div>
		</div>
	</section>
</div>

<style>
	/* 1. The Scanner Beam - Sharper movement */
	@keyframes scan-sweep {
		0% { transform: translateX(-150%) skewX(-20deg); }
		100% { transform: translateX(250%) skewX(-20deg); }
	}

	/* 2. Rotating Border Beam */
	@keyframes spin-border {
		0% { transform: translate(-50%, -50%) rotate(0deg); }
		100% { transform: translate(-50%, -50%) rotate(360deg); }
	}

	/* 3. Border Visibility - Matches perimeter duration */
	@keyframes border-active {
		0% { opacity: 0; }
		10% { opacity: 1; }
		85% { opacity: 1; }
		100% { opacity: 0; }
	}

	/* 5. Badge & Text Reveal */
	@keyframes fade-up {
		0% {
			transform: translateY(15px);
			opacity: 0;
		}
		100% {
			transform: translateY(0);
			opacity: 1;
		}
	}

	@keyframes plop {
		0% {
			transform: scale(0);
			opacity: 0;
		}
		70% {
			transform: scale(1.2);
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	/* The Scanner Beam Layer */
	.scanner-beam {
		/* Complex gradient for a "laser scan" look */
		background: linear-gradient(
			90deg, 
			transparent 0%, 
			rgba(16, 185, 129, 0) 45%,      /* Leading clear */
			rgba(16, 185, 129, 0.4) 48%,    /* Emerald tint trailing */
			rgba(255, 255, 255, 0.9) 50%,   /* Sharp White Core */
			rgba(16, 185, 129, 0.1) 52%,    /* Faint emerald lead */
			transparent 100%
		);
		width: 200%;
		height: 100%;
		position: absolute;
		top: 0;
		left: -100%;
		mix-blend-mode: screen; /* Brighter, techier blend */
		opacity: 0;
	}

	/* The Rotating Border Container */
	.rotating-border {
		position: absolute;
		inset: 0;
		/* border-radius: 0.75rem; In parent now (rounded-2xl is on section, but this div fills right column. Right column isn't rounded individually but section is. We can rely on overflow-hidden of section) */ 
		padding: 2px; 
		-webkit-mask: 
			linear-gradient(#fff 0 0) content-box, 
			linear-gradient(#fff 0 0);
		mask: 
			linear-gradient(#fff 0 0) content-box, 
			linear-gradient(#fff 0 0);
		-webkit-mask-composite: xor;
		mask-composite: exclude;
		opacity: 0;
	}

	.rotating-border::before {
		content: "";
		position: absolute;
		top: 50%;
		left: 50%;
		width: 250%; 
		height: 250%;
		/* Emerald & White Conic for "Verified" feel */
		background: conic-gradient(
			from 0deg,
			transparent 0%,
			transparent 40%,
			rgba(16, 185, 129, 0.8) 50%, /* Emerald tail */
			rgba(255, 255, 255, 1) 55%,  /* White head */
			transparent 60%,
			transparent 100%
		);
	}

	/* --- ANIMATION SEQUENCE TRIGGER --- */

	/* 1. Perimeter Animation */
	:global(.animate-sequence) .rotating-border {
		animation: border-active var(--perimeter-duration) linear forwards;
	}

	:global(.animate-sequence) .rotating-border::before {
		/* Rotates fast enough to look busy/analyzing */
		animation: spin-border 0.7s linear infinite;
	}

	/* 2. Scanner Beam - Finishes slightly before perimeter */
	:global(.animate-sequence) .scanner-beam {
		opacity: 1;
		animation: scan-sweep var(--scan-duration) var(--ease-scan) forwards;
	}

	/* 4. Reveal Stage - Starts after perimeter finishes */
	:global(.animate-sequence) .verified-info {
		animation: fade-up 0.8s var(--ease-out-expo) forwards;
		animation-delay: var(--perimeter-duration); 
	}

	:global(.animate-sequence) .verified-check {
		animation: plop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
		animation-delay: var(--perimeter-duration);
	}
	
	/* Image subtle zoom during scan */
	:global(.animate-sequence) img {
		transition: transform var(--perimeter-duration) var(--ease-out-expo);
		transform: scale(1.05);
	}
	
	/* Reset state */
	img { transform: scale(1); transition: transform 0.5s ease; }
</style>
