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

<section class="py-24 bg-muted/30 overflow-hidden">
	<div class="container mx-auto px-4 md:px-6">
		<div class="flex flex-col items-center text-center mb-16 space-y-4">
			<h2 class="mt-4 text-3xl md:text-4xl font-bold text-foreground">
				Reality Check
			</h2>
			<p class="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
				In a world of filters and AI, knowing what's real matters more than ever.
			</p>
		</div>

		<div class="grid lg:grid-cols-2 gap-12 lg:gap-24 items-start max-w-5xl mx-auto justify-items-center">
			
			<!-- The "Other" App (Instagram Style) -->
			<div class="relative group w-full max-w-[340px]">
				<!-- Thinking Cat (Always suspicious) -->
				<div class="absolute -top-24 -left-4 z-30 animate-bounce-subtle pointer-events-none">
					<img src="/landing/cat_think.gif" alt="Thinking Cat" class="w-28 h-28 object-contain drop-shadow-xl" />
					<div class="absolute right-0 -top-2 bg-white dark:bg-black text-foreground text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 transform rotate-12">
						Is this real? 🤔
					</div>
				</div>

				<div class="absolute -inset-4 bg-gradient-to-tr from-red-500/20 to-purple-500/20 blur-xl opacity-50 rounded-[3rem]"></div>
				<div class="relative bg-white dark:bg-black border-4 border-gray-200 dark:border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl h-[650px] flex flex-col">
					<!-- Fake Phone Status Bar -->
					<div class="h-6 w-full flex justify-between items-center px-6 mt-2 text-[10px] font-medium opacity-50">
						<span>9:41</span>
						<div class="flex gap-1">
							<div class="w-4 h-2.5 bg-current rounded-[1px]"></div>
							<div class="w-0.5 h-2.5 bg-current rounded-[1px]"></div>
						</div>
					</div>

					<!-- App Header -->
					<div class="flex justify-between items-center px-4 py-2 border-b border-gray-100 dark:border-gray-800">
						<span class="font-semibold text-base">{profile.username}</span>
						<div class="flex gap-4">
							<Heart class="h-5 w-5" />
							<MessageCircle class="h-5 w-5" />
						</div>
					</div>

					<div class="p-4 overflow-hidden pb-10">
						<!-- Profile Info -->
						<div class="flex items-center gap-4 mb-4">
							<div class="relative">
								<div class="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500">
									<img src={profile.avatar_url} alt="Profile" class="rounded-full w-full h-full object-cover border-2 border-white dark:border-black" />
								</div>
							</div>
							<div class="flex-1 flex justify-around text-center">
								<div>
									<div class="font-bold text-sm">1,245</div>
									<div class="text-[10px]">Posts</div>
								</div>
								<div>
									<div class="font-bold text-sm">45.2k</div>
									<div class="text-[10px]">Followers</div>
								</div>
								<div>
									<div class="font-bold text-sm">892</div>
									<div class="text-[10px]">Following</div>
								</div>
							</div>
						</div>
						
						<div class="px-1 mb-6">
							<div class="font-semibold text-sm">{profile.display_name}</div>
							<div class="text-xs">{profile.bio}</div>
						</div>

						<!-- Tabs -->
						<div class="flex justify-around border-t border-gray-100 dark:border-gray-800 py-2 mb-1">
							<Grid class="h-5 w-5 text-blue-500" />
						</div>

						<!-- Grid -->
						<div class="grid grid-cols-3 gap-0.5">
							{#each images as image, i}
								<div class="aspect-square relative overflow-hidden bg-gray-100">
									<img src={image.url} alt="Post" class="w-full h-full object-cover" />
									{#if image.fake}
										<div class="absolute inset-0 bg-black/40 flex items-center justify-center">
											<div class="bg-red-500 text-white px-2 py-0.5 rounded-full font-bold text-[8px] border border-white shadow-lg animate-slam-down" style="animation-delay: {i * 100}ms; animation-fill-mode: both;">
												FAKE ✕
											</div>
										</div>
									{/if}
								</div>
							{/each}
						</div>
					</div>
					
					<!-- Tab Bar -->
					<div class="mt-auto border-t border-gray-100 dark:border-gray-800 p-3 flex justify-around items-center bg-white dark:bg-black relative z-10">
						<div class="w-32 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
					</div>
				</div>
				<div class="text-center mt-6">
					<h3 class="text-xl font-bold mb-2 text-red-500">The Usual Suspects</h3>
					<p class="text-sm text-muted-foreground">Unverified content. Is it real? Is it AI? Who knows.</p>
				</div>
			</div>

			<!-- Right Side: Dennis Smith (Instagram + Proof in Bio Stack) -->
			<div class="relative group w-full max-w-[340px]">
				<!-- Dynamic Cat (Thinking -> Happy) https://giphy.com/Kennymays-->
				<div class="absolute -top-24 -right-4 z-30 pointer-events-none w-28 h-28">
					{#if showProof}
						<div class="absolute inset-0 animate-bounce-subtle" in:fade={{ duration: 300 }} out:fade={{ duration: 200 }}>
							<img src="/landing/cat_happy.gif" alt="Happy Cat" class="w-full h-full object-contain drop-shadow-xl" />
							<div class="absolute left-0 -top-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm transform -rotate-12">
								Verified! ✅
							</div>
						</div>
					{:else}
						<div class="absolute inset-0 animate-bounce-subtle" in:fade={{ duration: 300 }} out:fade={{ duration: 200 }}>
							<img src="/landing/cat_think.gif" alt="Thinking Cat" class="w-full h-full object-contain drop-shadow-xl" />
							<div class="absolute left-0 -top-2 bg-white dark:bg-black text-foreground text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 transform -rotate-12">
								Real? 🤔
							</div>
						</div>
					{/if}
				</div>

				<div class="absolute -inset-4 bg-gradient-to-tr from-green-500/20 to-blue-500/20 blur-xl opacity-50 rounded-[3rem]"></div>
				
				<!-- Container for stacked phones -->
				<div class="relative h-[650px] w-full">
					
					<!-- Phone 1: Dennis Instagram -->
					<div class="swap-card {showProof ? 'top' : 'bottom'} absolute inset-0 bg-white dark:bg-black border-4 border-gray-200 dark:border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col">
						<!-- Fake Phone Status Bar -->
						<div class="h-6 w-full flex justify-between items-center px-6 mt-2 text-[10px] font-medium opacity-50">
							<span>9:41</span>
							<div class="flex gap-1">
								<div class="w-4 h-2.5 bg-current rounded-[1px]"></div>
								<div class="w-0.5 h-2.5 bg-current rounded-[1px]"></div>
							</div>
						</div>

						<!-- App Header -->
						<div class="flex justify-between items-center px-4 py-2 border-b border-gray-100 dark:border-gray-800">
							<span class="font-semibold text-base">{profileDennis.username}</span>
							<div class="flex gap-4">
								<Heart class="h-5 w-5" />
								<MessageCircle class="h-5 w-5" />
							</div>
						</div>

						<div class="p-4 overflow-hidden pb-10">
							<!-- Profile Info -->
							<div class="flex items-center gap-4 mb-4">
								<div class="relative">
									<div class="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500">
										<img src={profileDennis.avatar_url} alt="Profile" class="rounded-full w-full h-full object-cover border-2 border-white dark:border-black" />
									</div>
								</div>
								<div class="flex-1 flex justify-around text-center">
									<div>
										<div class="font-bold text-sm">342</div>
										<div class="text-[10px]">Posts</div>
									</div>
									<div>
										<div class="font-bold text-sm">12.8k</div>
										<div class="text-[10px]">Followers</div>
									</div>
									<div>
										<div class="font-bold text-sm">450</div>
										<div class="text-[10px]">Following</div>
									</div>
								</div>
							</div>
							
							<div class="px-1 mb-6">
								<div class="font-semibold text-sm">{profileDennis.display_name}</div>
								<div class="text-xs">{profileDennis.bio}</div>
								<div class="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-1">{profileDennis.link}</div>
							</div>

							<!-- Tabs -->
							<div class="flex justify-around border-t border-gray-100 dark:border-gray-800 py-2 mb-1">
								<Grid class="h-5 w-5 text-blue-500" />
							</div>

							<!-- Grid -->
							<div class="grid grid-cols-3 gap-0.5">
								{#each images as image, i}
									<div class="aspect-square relative overflow-hidden bg-gray-100">
										<img src={image.url} alt="Post" class="w-full h-full object-cover" />
									</div>
								{/each}
							</div>
						</div>
						
						<!-- Tab Bar -->
						<div class="mt-auto border-t border-gray-100 dark:border-gray-800 p-3 flex justify-around items-center bg-white dark:bg-black relative z-10">
							<div class="w-32 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
						</div>
					</div>

					<!-- Phone 2: Proof in Bio (Dennis) -->
					<div class="swap-card {showProof ? 'bottom' : 'top'} absolute inset-0 bg-white dark:bg-black text-foreground border-4 border-gray-200 dark:border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col">
						<!-- Fake Phone Status Bar -->
						<div class="h-6 w-full flex justify-between items-center px-6 mt-2 text-[10px] font-medium opacity-50">
							<span>9:41</span>
							<div class="flex gap-1">
								<div class="w-4 h-2.5 bg-current rounded-[1px]"></div>
								<div class="w-0.5 h-2.5 bg-current rounded-[1px]"></div>
							</div>
						</div>

						<!-- Content Area (Scrollable) -->
						<div class="flex-1 overflow-hidden">
                            <span class="font-bold pt-6 pl-5 text-lg text-foreground">ProofInBio</span>
							<!-- Hero/Header area -->
							<div class="px-6 pt-8 pb-6">
								<div class="flex flex-col items-center text-center gap-4">
									<Avatar class="h-20 w-20 border-2 border-background shadow-xl">
										<AvatarImage src={profileDennis.avatar_url} alt={profileDennis.display_name} />
										<AvatarFallback>DS</AvatarFallback>
									</Avatar>
									
									<div>
										<h1 class="text-xl font-bold tracking-tight">
											{profileDennis.display_name}
										</h1>
										<p class="text-xs text-muted-foreground">@{profileDennis.username}</p>
										<p class="mt-2 text-[11px] text-balance max-w-[200px] mx-auto">{profileDennis.bio}</p>
										<div class="mt-3 flex flex-wrap justify-center gap-1.5">
											{#each profileDennis.interests as interest}
												<Badge variant="secondary" class="text-[9px] px-1.5 py-0">{interest}</Badge>
											{/each}
										</div>
									</div>
								</div>

								<!-- Authenticated Photos Alert -->
								<div class="mt-6 backdrop-blur-md bg-green-500/10 flex w-full items-center rounded-lg border border-green-500/20 py-2 px-3">
									<ShieldCheck class="h-4 w-4 mt-0.5 shrink-0 text-green-600" />
									<div class="ml-2.5 flex-grow">
										<h5 class="font-semibold text-[10px] text-green-700 dark:text-green-400">Made by Humans.</h5>
										<div class="text-[9px] text-muted-foreground">
											Verified authentic. No AI.
										</div>
									</div>
								</div>
							</div>

							<!-- Photo Grid -->
							<div class="px-4 pb-10">
								<div class="grid grid-cols-3 gap-0.5">
									{#each images as image, i}
										<div class="aspect-square relative overflow-hidden bg-gray-100">
											<img
												src={image.url}
												alt="User photo"
												class="w-full h-full object-cover"
											/>
											<!-- Verified Checkmark Overlay -->
											<div class="absolute top-1 right-1 bg-green-500 text-white rounded-full p-0.5 shadow-sm">
												<CheckCircle class="h-2 w-2" />
											</div>
										</div>
									{/each}
								</div>
							</div>
						</div>

						<!-- Tab Bar -->
						<div class="mt-auto border-t border-gray-100 dark:border-gray-800 p-3 flex justify-around items-center bg-white dark:bg-black relative z-10">
							<div class="w-32 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
						</div>
					</div>

					<!-- Hand Cursor Animation -->
					<div 
						class="absolute z-50 pointer-events-none transition-all duration-200 ease-out"
						style="
							top: 215px;
							left: 30%;
							transform: translate(-10%, -10%) translate({showHand ? '0px, 0px' : '20px, 20px'}) scale({clickHand ? 0.9 : 1});
							opacity: {showHand ? 1 : 0};
						"
					>
						<img src="/landing/mini_pointer.png" alt="Hand cursor" class="w-12 h-12 drop-shadow-xl" />
					</div>
				</div>

				<div class="text-center mt-6">
					<h3 class="text-xl font-bold mb-2">Prove it with <span class="text-green-600">ProofInBio</span></h3>
					<p class="text-sm text-muted-foreground">Seamlessly verify your identity from Instagram.</p>
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
