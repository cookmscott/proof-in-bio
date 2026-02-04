<script>
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { CheckCircle, X, Grid, Heart, MessageCircle, Share2, ShieldCheck, User } from 'lucide-svelte';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/ui/avatar';
	import { Badge } from '$lib/ui/badge';
	import { Button } from '$lib/ui/button';
	import { Card } from '$lib/ui/card';
	import { AspectRatio } from '$lib/ui/aspect-ratio';

	// Mock data for images
	const images = Array.from({ length: 9 }).map((_, i) => ({
		id: i,
		url: `https://picsum.photos/400/400?random=${i + 10}`,
		fake: i % 2 === 0 // Every other image is "fake" on the other app
	}));

	let profile = {
		display_name: "Sarah Jenkins",
		username: "sarahj_creative",
		bio: "Digital Artist | capturing the unseen moments 📸 | based in NYC",
		avatar_url: "https://i.pravatar.cc/150?u=sarah",
		interests: ["Photography", "Travel", "Art"]
	};

	let profileDennis = {
		display_name: "Dennis Smith",
		username: "dennis_creates",
		bio: "Digital Creator | 🎨 | Link below 👇",
		link: "proofin.bio/dennis",
		avatar_url: "https://i.pravatar.cc/150?u=dennis",
		interests: ["3D Art", "Motion", "Design"]
	};

	let showProof = false;
	let showHand = false;
	let clickHand = false;

	onMount(() => {
		let mounted = true;
		let timer;

		const runSequence = async () => {
			if (!mounted) return;

			if (!showProof) {
				// Instagram view: wait, then click
				await new Promise(r => timer = setTimeout(r, 2000));
				if (!mounted) return;

				showHand = true;
				await new Promise(r => timer = setTimeout(r, 800)); // Move in
				if (!mounted) return;

				clickHand = true;
				await new Promise(r => timer = setTimeout(r, 200)); // Click press
				if (!mounted) return;

				showProof = true;
				clickHand = false;
				showHand = false;
				
				runSequence();
			} else {
				// Proof view: wait, then switch back
				await new Promise(r => timer = setTimeout(r, 4000));
				if (!mounted) return;

				showProof = false;
				runSequence();
			}
		};

		runSequence();

		return () => {
			mounted = false;
			clearTimeout(timer);
		};
	});
</script>

<section class="py-24 bg-zinc-50 dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100 overflow-hidden font-sans selection:bg-orange-500 selection:text-white">
	<div class="container mx-auto px-4 md:px-6">
		<div class="flex flex-col items-center text-center mb-20 space-y-6">
			<span class="text-xs font-bold tracking-widest text-zinc-500 uppercase">Reality Check</span>
			<h2 class="text-4xl md:text-6xl font-bold leading-[0.95] tracking-tight">
				Real vs. <span class="text-red-500">Fake</span>
			</h2>
			<p class="mx-auto max-w-[600px] text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed">
				In a world of prompts, knowing the origin matters.
			</p>
		</div>

		<div class="grid lg:grid-cols-2 gap-20 lg:gap-24 items-start max-w-5xl mx-auto justify-items-center">
			
			<!-- The "Other" App (Instagram Style) -->
			<div class="relative group w-full max-w-[360px]">
				<div class="text-center mb-8">
					<h2 class="text-xl font-bold mb-2 text-red-500">Unproven</h2>
					<p class="text-sm text-zinc-500 dark:text-zinc-400">Is it real? Is it AI? Who knows.</p>
				</div>
				<!-- Thinking Cat (Always suspicious) -->
				<div class="absolute -top-10 -left-8 z-30 animate-bounce-subtle pointer-events-none">
					<img src="/landing/cat_think.gif" alt="Thinking Cat" class="w-28 h-28 object-contain drop-shadow-xl" />
					<div class="absolute right-0 -top-2 bg-[#FFF9EE] dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-sm transform rotate-12">
						Is this real? 🤔
					</div>
				</div>

				<div class="relative phone-shell bg-[#FFF9EE] dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-[2.5rem] overflow-hidden h-[680px] flex flex-col shadow-2xl border-4 border-zinc-200 dark:border-zinc-800">
					<!-- App Header -->
					<div class="flex justify-between items-center px-6 py-6">
						<span class="font-bold text-lg tracking-tight">{profile.username}</span>
						<div class="flex gap-4">
							<Heart class="h-5 w-5" />
							<MessageCircle class="h-5 w-5" />
						</div>
					</div>

					<div class="px-6 pb-8 flex-1 flex flex-col">
						<!-- Profile Info -->
						<div class="flex items-center gap-6 mb-6">
							<div class="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500">
								<img src={profile.avatar_url} alt="Profile" class="rounded-full w-full h-full object-cover border-2 border-white" />
							</div>
							<div class="flex-1 flex justify-around text-center">
								<div>
									<div class="font-bold text-lg">1.2k</div>
									<div class="text-[10px] uppercase tracking-wider opacity-60">Posts</div>
								</div>
								<div>
									<div class="font-bold text-lg">45k</div>
									<div class="text-[10px] uppercase tracking-wider opacity-60">Followers</div>
								</div>
								<div>
									<div class="font-bold text-lg">892</div>
									<div class="text-[10px] uppercase tracking-wider opacity-60">Following</div>
								</div>
							</div>
						</div>
						
						<div class="mb-8">
							<div class="font-bold text-base mb-1">{profile.display_name}</div>
							<div class="text-sm opacity-80 leading-snug">{profile.bio}</div>
						</div>

						<!-- Tabs -->
						<div class="flex justify-around border-t border-zinc-200 dark:border-zinc-800 py-3 mb-1">
							<Grid class="h-6 w-6 text-zinc-900 dark:text-zinc-100" />
						</div>

						<!-- Grid -->
						<div class="grid grid-cols-3 gap-1 flex-1 content-start">
							{#each images as image, i}
								<div class="aspect-square relative overflow-hidden bg-zinc-100 dark:bg-zinc-800 rounded-md">
									<img src={image.url} alt="Post" class="w-full h-full object-cover" />
									{#if image.fake}
										<div class="absolute inset-0 bg-black/40 flex items-center justify-center">
											<div class="bg-red-500 text-white px-3 py-1 rounded-full font-bold text-[10px] tracking-widest uppercase shadow-lg animate-slam-down" style="animation-delay: {i * 100}ms; animation-fill-mode: both;">
												Fake
											</div>
										</div>
									{/if}
								</div>
							{/each}
						</div>
					</div>
					
					<!-- Bottom Indicator -->
					<div class="p-6 flex justify-center">
						<div class="w-32 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full"></div>
					</div>
				</div>
			</div>

			<!-- Right Side: Dennis Smith (Instagram + Proof in Bio Stack) -->
			<div class="relative group w-full max-w-[360px]">
				<div class="text-center mb-8">
					<h3 class="text-xl font-bold mb-2 text-[#00D165]">Proven human capture</h3>
					<p class="text-sm text-zinc-500 dark:text-zinc-400">We check it’s real — not fake or AI-generated.</p>
				</div>
				<!-- Dynamic Cat (Thinking -> Happy) https://giphy.com/Kennymays-->
				<div class="absolute -top-10 -right-8 z-30 pointer-events-none w-28 h-28">
					{#if showProof}
						<div class="absolute inset-0 animate-bounce-subtle">
							<img src="/landing/cat_happy.gif" alt="Happy Cat" class="w-full h-full object-contain drop-shadow-xl" />
							<div class="absolute left-0 -top-2 bg-[#00D165] text-white text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-sm transform -rotate-12">
								Proven! ✅
							</div>
						</div>
					{:else}
						<div class="absolute inset-0 animate-bounce-subtle">
							<img src="/landing/cat_think.gif" alt="Thinking Cat" class="w-full h-full object-contain drop-shadow-xl" />
							<div class="absolute left-0 -top-2 bg-[#FFF9EE] dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-sm transform -rotate-12">
								Real? 🤔
							</div>
						</div>
					{/if}
				</div>

				<!-- Container for stacked phones -->
				<div class="relative h-[680px] w-full">
					
					<!-- Phone 1: Dennis Instagram -->
					<div class="swap-card phone-shell {showProof ? 'top' : 'bottom'} absolute inset-0 bg-[#FFF9EE] dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col border-4 border-zinc-200 dark:border-zinc-800">
						<!-- App Header -->
						<div class="flex justify-between items-center px-6 py-6">
							<span class="font-bold text-lg tracking-tight">{profileDennis.username}</span>
							<div class="flex gap-4">
								<Heart class="h-5 w-5" />
								<MessageCircle class="h-5 w-5" />
							</div>
						</div>

						<div class="px-6 pb-8 flex-1 flex flex-col">
							<!-- Profile Info -->
							<div class="flex items-center gap-6 mb-6">
								<div class="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500">
									<img src={profileDennis.avatar_url} alt="Profile" class="rounded-full w-full h-full object-cover border-2 border-white" />
								</div>
								<div class="flex-1 flex justify-around text-center">
									<div>
										<div class="font-bold text-lg">342</div>
										<div class="text-[10px] uppercase tracking-wider opacity-60">Posts</div>
									</div>
									<div>
										<div class="font-bold text-lg">12k</div>
										<div class="text-[10px] uppercase tracking-wider opacity-60">Followers</div>
									</div>
									<div>
										<div class="font-bold text-lg">450</div>
										<div class="text-[10px] uppercase tracking-wider opacity-60">Following</div>
									</div>
								</div>
							</div>
							
							<div class="mb-8">
								<div class="font-bold text-base mb-1">{profileDennis.display_name}</div>
								<div class="text-sm opacity-80 leading-snug">{profileDennis.bio}</div>
								<div class="text-sm text-[#FF5D00] font-bold mt-2">{profileDennis.link}</div>
							</div>

							<!-- Tabs -->
							<div class="flex justify-around border-t border-zinc-200 dark:border-zinc-800 py-3 mb-1">
								<Grid class="h-6 w-6 text-zinc-900 dark:text-zinc-100" />
							</div>

							<!-- Grid -->
							<div class="grid grid-cols-3 gap-1 flex-1 content-start">
								{#each images as image, i}
									<div class="aspect-square relative overflow-hidden bg-zinc-100 dark:bg-zinc-800 rounded-md">
										<img src={image.url} alt="Post" class="w-full h-full object-cover" />
									</div>
								{/each}
							</div>
						</div>
						
						<!-- Bottom Indicator -->
						<div class="p-6 flex justify-center">
							<div class="w-32 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full"></div>
						</div>
					</div>

					<!-- Phone 2: Proof in Bio (Dennis) -->
					<div class="swap-card phone-shell {showProof ? 'bottom' : 'top'} absolute inset-0 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col border-4 border-zinc-200 dark:border-zinc-800">

						<!-- Content Area (Scrollable) -->
						<div class="flex-1 overflow-hidden">
							<!-- App Header -->
							<div class="flex justify-between items-center px-6 pt-8 pb-4">
								<div class="flex items-center gap-2">
									<div class="w-6 h-6 rounded-full bg-gradient-to-tr from-orange-400 to-red-500"></div>
									<span class="font-bold text-lg tracking-tight">ProofInBio</span>
								</div>
								<div class="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden border border-zinc-200 dark:border-zinc-700">
									<img src="https://i.pravatar.cc/150?u=user" alt="User" class="w-full h-full object-cover" />
								</div>
							</div>

							<!-- Profile Header -->
							<div class="px-6 pb-6">
								<div class="flex flex-row items-start gap-5">
									<!-- Left: Avatar -->
									<div class="flex-shrink-0">
										<Avatar class="h-20 w-20 border-4 border-zinc-50 dark:border-zinc-900 shadow-sm">
											<AvatarImage src={profileDennis.avatar_url} alt={profileDennis.display_name} />
											<AvatarFallback>DS</AvatarFallback>
										</Avatar>
									</div>
									
									<!-- Right: Info Stack -->
									<div class="flex flex-col pt-1 min-w-0">
										<h1 class="text-xl font-bold tracking-tight leading-none text-zinc-900 dark:text-zinc-100">
											{profileDennis.display_name}
										</h1>
										<p class="text-xs text-zinc-400 dark:text-zinc-500 font-medium mt-1">@{profileDennis.username}</p>
										<p class="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-3">{profileDennis.bio}</p>
										<div class="mt-3 flex flex-wrap gap-1.5">
											{#each profileDennis.interests as interest}
												<Badge variant="secondary" class="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 border-0 text-[9px] px-2 py-0.5 rounded-full font-medium">{interest}</Badge>
											{/each}
										</div>
									</div>
								</div>

								<!-- Authenticated Photos Alert -->
								<div class="mt-6 min-h-[52px]">
									{#key showProof}
										{#if showProof}
											<div class="bg-[#00D165] flex w-full items-center rounded-xl p-3 text-white animate-bam">
												<ShieldCheck class="h-4 w-4 shrink-0 relative z-10" />
												<div class="ml-3 flex-grow relative z-10">
													<h5 class="font-bold text-[12px] uppercase tracking-wider leading-none">Proven Human Capture</h5>
													<div class="text-[12px] mt-0.5">
														Not fake or AI-generated.
													</div>
												</div>
											</div>
										{/if}
									{/key}
								</div>
							</div>

							<!-- Photo Grid -->
							<div class="px-6 pb-10">
								<div class="grid grid-cols-3 gap-1">
									{#each images as image, i}
										<div class="aspect-square relative overflow-hidden bg-zinc-100 dark:bg-zinc-800 rounded-lg">
											<img
												src={image.url}
												alt="User photo"
												class="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
											/>
											<!-- Verified Checkmark Overlay -->
											<div class="absolute top-1 right-1 bg-[#00D165] text-white rounded-full p-0.5 shadow-sm">
												<CheckCircle class="h-3 w-3" />
											</div>
										</div>
									{/each}
								</div>
							</div>
						</div>
					</div>

					<!-- Hand Cursor Animation -->
					<div 
						class="absolute z-50 pointer-events-none transition-all duration-200 ease-out"
						style="
							top: 240px;
							left: 30%;
							transform: translate(-10%, -10%) translate({showHand ? '0px, 0px' : '20px, 20px'}) scale({clickHand ? 0.9 : 1});
							opacity: {showHand ? 1 : 0};
						"
					>
						<img src="/landing/mini_pointer.png" alt="Hand cursor" class="w-12 h-12 drop-shadow-xl" />
					</div>
				</div>
			</div>

		</div>
	</div>
</section>

<style>
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	@keyframes pulse-slow {
		0%, 100% { opacity: 1; }
		80% { opacity: 0.8; }
	}
	@keyframes bounce-subtle {
		0%, 100% { transform: rotate(-12deg) scale(1); }
		50% { transform: rotate(-12deg) scale(1.1); }
	}
	.animate-pulse-slow {
		animation: pulse-slow 3s infinite ease-in-out;
	}
	.animate-bounce-subtle {
		animation: bounce-subtle 2s infinite ease-in-out;
	}
	@keyframes slam-down {
		0% { transform: scale(3) rotate(-12deg); opacity: 0; }
		5% { transform: scale(1) rotate(-12deg); opacity: 1; }
		8% { transform: scale(1.1) rotate(-12deg); }
		10% { transform: scale(1) rotate(-12deg); }
		80% { transform: scale(1) rotate(-12deg); opacity: 1; }
		90% { transform: scale(1) rotate(-12deg); opacity: 0; }
		100% { transform: scale(3) rotate(-12deg); opacity: 0; }
	}
	.animate-slam-down {
		animation: slam-down 4s ease-out infinite;
	}
	.phone-shell {
		position: relative;
		box-shadow: 0 30px 70px rgba(0, 0, 0, 0.18), 0 6px 12px rgba(0, 0, 0, 0.12);
	}
	.phone-shell::before {
		content: "";
		position: absolute;
		inset: 0;
		border-radius: inherit;
		pointer-events: none;
		box-shadow:
			inset 0 0 0 1px rgba(255, 255, 255, 0.65),
			inset 0 0 0 2px rgba(0, 0, 0, 0.08),
			inset 0 16px 24px rgba(255, 255, 255, 0.25);
		background: linear-gradient(
			120deg,
			rgba(255, 255, 255, 0.16) 0%,
			rgba(255, 255, 255, 0.06) 18%,
			rgba(255, 255, 255, 0) 32%,
			rgba(255, 255, 255, 0.08) 58%,
			rgba(255, 255, 255, 0) 75%
		);
		opacity: 0.4;
	}
	.phone-shell::after {
		content: "";
		position: absolute;
		bottom: 10px;
		left: 50%;
		transform: translateX(-50%);
		width: 110px;
		height: 5px;
		border-radius: 999px;
		background: rgba(0, 0, 0, 0.25);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.25),
			0 1px 2px rgba(0, 0, 0, 0.25);
		opacity: 0.6;
		pointer-events: none;
	}
	:global(.dark) .phone-shell::before {
		box-shadow:
			inset 0 0 0 1px rgba(255, 255, 255, 0.12),
			inset 0 0 0 2px rgba(0, 0, 0, 0.4),
			inset 0 16px 24px rgba(255, 255, 255, 0.05);
		opacity: 0.35;
	}
	:global(.dark) .phone-shell::after {
		background: rgba(255, 255, 255, 0.2);
	}
	@keyframes sheen-sweep {
		0%   { transform: translateX(-120%) rotate(12deg); opacity: 0; }
		8%   { opacity: 0.9; }
		50%  { opacity: 1; }
		92%  { opacity: 0.85; }
		100% { transform: translateX(120%) rotate(12deg); opacity: 0; }
	}
	.animate-bam {
		position: relative;
		overflow: hidden;
		isolation: isolate;
	}
	.animate-bam::after {
		content: "";
		position: absolute;
		inset: -40% -60%;
		width: 200%;
		height: 180%;
		pointer-events: none;
		z-index: 1;
		background: linear-gradient(
			90deg,
			rgba(255,255,255,0) 0%,
			rgba(255,255,255,0.18) 35%,
			rgba(255,255,255,0.55) 50%,
			rgba(255,255,255,0.18) 65%,
			rgba(255,255,255,0) 100%
		);
		filter: blur(0.2px);
		mix-blend-mode: screen;
		transform: translateX(-120%) rotate(12deg);
		opacity: 0;
		animation: sheen-sweep 980ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
		animation-delay: 560ms;
	}
	@media (prefers-reduced-motion: reduce) {
		.animate-bam,
		.animate-bam::after {
			animation: none !important;
		}
	}

/* Ultra-smooth orbit swap with Midpoint Opacity Control */
:root {
  /* slower = smoother */
  --dur: 400ms;

  /* positions */
  --x-static: -18px; /* Resting Left */
  --y-top: -6px;
  --y-bot: 6px;

  /* Orbit Radius: The "swing" width */
  --x-offset: 20px; 

  /* depth via scale */
  --scaleTop: 1.02;
  --scaleBot: 0.96;

  /* OPACITY CONFIGURATION */
  --frontOpacity: 1;
  --backOpacity: 0.8;
  
  /* The opacity at the exact center of the swap (50%) */
  /* Setting this lower (e.g., 0.6) creates a "pass-through" effect */
  --midOpacity: 0.3; 
}

.swap-card {
  will-change: transform, opacity, z-index;
  backface-visibility: hidden;
  transform-origin: 50% 50%;
  position: absolute;
  cursor: pointer;
  
  /* Default stacking context */
  z-index: 10;
}

.swap-card.top {
  z-index: 20;
  animation: toBottom var(--dur) linear both;
}

.swap-card.bottom {
  z-index: 10;
  animation: toTop var(--dur) linear both;
}

/* LOGIC SUMMARY:
   1. Trajectory: Linear X/Y blend + Sine Wave offset for the "Orbit".
   2. Opacity: Split into two ease-in-out curves.
      0% -> 50%: Eases from Start -> Mid
      50% -> 100%: Eases from Mid -> End
   3. Z-Index: Hard swap at 50% to ensure the click registers on the new top card.
*/

@keyframes toBottom {
  /* TOP CARD moves to BACK (Right -> Down -> Back) */
  
  /* 0%: Start at Top */
  0% {
    transform: translate3d(var(--x-static), var(--y-top), 0) scale(var(--scaleTop));
    opacity: var(--frontOpacity);
    z-index: 20;
  }
  
  /* 10%: Start -> Mid Opacity (Ease Progress: 0.095) */
  10% {
    transform: translate3d(
      calc((var(--x-static) * 0.8) + (var(--x-offset) * 0.3090)),
      calc((var(--y-top) * 0.9) + (var(--y-bot) * 0.1)),
      0
    ) scale(calc(var(--scaleTop) + (var(--scaleBot) - var(--scaleTop)) * 0.02447));
    opacity: calc(var(--frontOpacity) + (var(--midOpacity) - var(--frontOpacity)) * 0.0955);
  }

  /* 20%: Start -> Mid Opacity (Ease Progress: 0.345) */
  20% {
    transform: translate3d(
      calc((var(--x-static) * 0.6) + (var(--x-offset) * 0.5878)),
      calc((var(--y-top) * 0.8) + (var(--y-bot) * 0.2)),
      0
    ) scale(calc(var(--scaleTop) + (var(--scaleBot) - var(--scaleTop)) * 0.09549));
    opacity: calc(var(--frontOpacity) + (var(--midOpacity) - var(--frontOpacity)) * 0.3455);
  }

  /* 30%: Start -> Mid Opacity (Ease Progress: 0.655) */
  30% {
    transform: translate3d(
      calc((var(--x-static) * 0.4) + (var(--x-offset) * 0.8090)),
      calc((var(--y-top) * 0.7) + (var(--y-bot) * 0.3)),
      0
    ) scale(calc(var(--scaleTop) + (var(--scaleBot) - var(--scaleTop)) * 0.20611));
    opacity: calc(var(--frontOpacity) + (var(--midOpacity) - var(--frontOpacity)) * 0.6545);
  }

  /* 40%: Start -> Mid Opacity (Ease Progress: 0.905) */
  40% {
    transform: translate3d(
      calc((var(--x-static) * 0.2) + (var(--x-offset) * 0.9511)),
      calc((var(--y-top) * 0.6) + (var(--y-bot) * 0.4)),
      0
    ) scale(calc(var(--scaleTop) + (var(--scaleBot) - var(--scaleTop)) * 0.34549));
    opacity: calc(var(--frontOpacity) + (var(--midOpacity) - var(--frontOpacity)) * 0.9045);
  }

  /* 50%: APEX - Max Width, Mid Opacity, Z-Index Swap */
  50% {
    transform: translate3d(
      calc(0px + var(--x-offset)), 
      calc((var(--y-top) + var(--y-bot)) * 0.5), 
      0
    ) scale(calc(var(--scaleTop) + (var(--scaleBot) - var(--scaleTop)) * 0.5));
    opacity: var(--midOpacity);
    z-index: 20; /* Still on top for the very last pixel of the first half */
  }
  
  /* Crucial: Drop Z-index immediately after apex so clicks hit the OTHER card coming forward */
  50.1% { z-index: 10; } 

  /* 60%: Mid -> End Opacity (Ease Progress: 0.095) */
  60% {
    transform: translate3d(
      calc((var(--x-static) * -0.2) + (var(--x-offset) * 0.9511)),
      calc((var(--y-top) * 0.4) + (var(--y-bot) * 0.6)),
      0
    ) scale(calc(var(--scaleTop) + (var(--scaleBot) - var(--scaleTop)) * 0.65451));
    opacity: calc(var(--midOpacity) + (var(--backOpacity) - var(--midOpacity)) * 0.0955);
  }

  /* 70%: Mid -> End Opacity (Ease Progress: 0.345) */
  70% {
    transform: translate3d(
      calc((var(--x-static) * -0.4) + (var(--x-offset) * 0.8090)),
      calc((var(--y-top) * 0.3) + (var(--y-bot) * 0.7)),
      0
    ) scale(calc(var(--scaleTop) + (var(--scaleBot) - var(--scaleTop)) * 0.79389));
    opacity: calc(var(--midOpacity) + (var(--backOpacity) - var(--midOpacity)) * 0.3455);
  }

  /* 80%: Mid -> End Opacity (Ease Progress: 0.655) */
  80% {
    transform: translate3d(
      calc((var(--x-static) * -0.6) + (var(--x-offset) * 0.5878)),
      calc((var(--y-top) * 0.2) + (var(--y-bot) * 0.8)),
      0
    ) scale(calc(var(--scaleTop) + (var(--scaleBot) - var(--scaleTop)) * 0.90451));
    opacity: calc(var(--midOpacity) + (var(--backOpacity) - var(--midOpacity)) * 0.6545);
  }

  /* 90%: Mid -> End Opacity (Ease Progress: 0.905) */
  90% {
    transform: translate3d(
      calc((var(--x-static) * -0.8) + (var(--x-offset) * 0.3090)),
      calc((var(--y-top) * 0.1) + (var(--y-bot) * 0.9)),
      0
    ) scale(calc(var(--scaleTop) + (var(--scaleBot) - var(--scaleTop)) * 0.97553));
    opacity: calc(var(--midOpacity) + (var(--backOpacity) - var(--midOpacity)) * 0.9045);
  }

  /* 100%: End at Back */
  100% {
    transform: translate3d(calc(var(--x-static) * -1), var(--y-bot), 0) scale(var(--scaleBot));
    opacity: var(--backOpacity);
    z-index: 10;
  }
}

@keyframes toTop {
  /* BOTTOM CARD moves to FRONT (Left -> Up -> Front) */
  
  /* 0%: Start at Back */
  0% {
    transform: translate3d(calc(var(--x-static) * -1), var(--y-bot), 0) scale(var(--scaleBot));
    opacity: var(--backOpacity);
    z-index: 10;
  }

  /* 10%: Back -> Mid Opacity */
  10% {
    transform: translate3d(
      calc((var(--x-static) * -0.8) - (var(--x-offset) * 0.3090)),
      calc((var(--y-bot) * 0.9) + (var(--y-top) * 0.1)),
      0
    ) scale(calc(var(--scaleBot) + (var(--scaleTop) - var(--scaleBot)) * 0.02447));
    opacity: calc(var(--backOpacity) + (var(--midOpacity) - var(--backOpacity)) * 0.0955);
  }

  /* 20% */
  20% {
    transform: translate3d(
      calc((var(--x-static) * -0.6) - (var(--x-offset) * 0.5878)),
      calc((var(--y-bot) * 0.8) + (var(--y-top) * 0.2)),
      0
    ) scale(calc(var(--scaleBot) + (var(--scaleTop) - var(--scaleBot)) * 0.09549));
    opacity: calc(var(--backOpacity) + (var(--midOpacity) - var(--backOpacity)) * 0.3455);
  }

  /* 30% */
  30% {
    transform: translate3d(
      calc((var(--x-static) * -0.4) - (var(--x-offset) * 0.8090)),
      calc((var(--y-bot) * 0.7) + (var(--y-top) * 0.3)),
      0
    ) scale(calc(var(--scaleBot) + (var(--scaleTop) - var(--scaleBot)) * 0.20611));
    opacity: calc(var(--backOpacity) + (var(--midOpacity) - var(--backOpacity)) * 0.6545);
  }

  /* 40% */
  40% {
    transform: translate3d(
      calc((var(--x-static) * -0.2) - (var(--x-offset) * 0.9511)),
      calc((var(--y-bot) * 0.6) + (var(--y-top) * 0.4)),
      0
    ) scale(calc(var(--scaleBot) + (var(--scaleTop) - var(--scaleBot)) * 0.34549));
    opacity: calc(var(--backOpacity) + (var(--midOpacity) - var(--backOpacity)) * 0.9045);
  }

  /* 50%: APEX - Max Width, Mid Opacity */
  50% {
    transform: translate3d(
      calc(0px - var(--x-offset)),
      calc((var(--y-bot) + var(--y-top)) * 0.5),
      0
    ) scale(calc(var(--scaleBot) + (var(--scaleTop) - var(--scaleBot)) * 0.5));
    opacity: var(--midOpacity);
    z-index: 10;
  }
  
  /* Pop to front immediately after crossing the halfway point */
  50.1% { z-index: 20; }

  /* 60%: Mid -> Front Opacity */
  60% {
    transform: translate3d(
      calc((var(--x-static) * 0.2) - (var(--x-offset) * 0.9511)),
      calc((var(--y-bot) * 0.4) + (var(--y-top) * 0.6)),
      0
    ) scale(calc(var(--scaleBot) + (var(--scaleTop) - var(--scaleBot)) * 0.65451));
    opacity: calc(var(--midOpacity) + (var(--frontOpacity) - var(--midOpacity)) * 0.0955);
  }

  /* 70% */
  70% {
    transform: translate3d(
      calc((var(--x-static) * 0.4) - (var(--x-offset) * 0.8090)),
      calc((var(--y-bot) * 0.3) + (var(--y-top) * 0.7)),
      0
    ) scale(calc(var(--scaleBot) + (var(--scaleTop) - var(--scaleBot)) * 0.79389));
    opacity: calc(var(--midOpacity) + (var(--frontOpacity) - var(--midOpacity)) * 0.3455);
  }

  /* 80% */
  80% {
    transform: translate3d(
      calc((var(--x-static) * 0.6) - (var(--x-offset) * 0.5878)),
      calc((var(--y-bot) * 0.2) + (var(--y-top) * 0.8)),
      0
    ) scale(calc(var(--scaleBot) + (var(--scaleTop) - var(--scaleBot)) * 0.90451));
    opacity: calc(var(--midOpacity) + (var(--frontOpacity) - var(--midOpacity)) * 0.6545);
  }

  /* 90% */
  90% {
    transform: translate3d(
      calc((var(--x-static) * 0.8) - (var(--x-offset) * 0.3090)),
      calc((var(--y-bot) * 0.1) + (var(--y-top) * 0.9)),
      0
    ) scale(calc(var(--scaleBot) + (var(--scaleTop) - var(--scaleBot)) * 0.97553));
    opacity: calc(var(--midOpacity) + (var(--frontOpacity) - var(--midOpacity)) * 0.9045);
  }

  /* 100%: End at Front */
  100% {
    transform: translate3d(var(--x-static), var(--y-top), 0) scale(var(--scaleTop));
    opacity: var(--frontOpacity);
    z-index: 20;
  }
}
</style>
