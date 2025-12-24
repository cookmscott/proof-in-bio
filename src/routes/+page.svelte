<!--
  +page.svelte
  Landing page for Proof in Bio - a C2PA-verified photo platform
  Updated aesthetic: Cinematic realism with emotional grit.
-->
<script>
	import { Button } from '$lib/ui/button/index.js';
	import { Card } from '$lib/ui/card/index.js';
	import { Badge } from '$lib/ui/badge/index.js';
	import AuthDialog from '$lib/components/auth-dialog.svelte';
	import { authDialog } from '$lib/stores/auth';
	import PolaroidScroll from '$lib/components/polaroid-scroll.svelte';
	import EssentialVerification from '$lib/components/essential-verification.svelte';	
	import ProblemSolution from '$lib/components/ProblemSolution.svelte';
	import HowItWorks from '$lib/components/HowItWorks.svelte';

	import {
		CheckCircle2,
		ShieldCheck,
		Camera,
		ArrowRight,
		Upload,
		Sparkles,
		XCircle,
		Link2,
		Zap
	} from 'lucide-svelte';
	

	// Get data from layout (includes supabase client)
	let { data } = $props();

	function handleAuthSuccess(event) {
		console.log('User authenticated:', event.detail);
		authDialog.set({ open: false, mode: 'login' });
		// User will be automatically redirected by the dialog
	}

	function handleAuthClose() {
		authDialog.set({ open: false, mode: 'login' });
	}

</script>

<div class="bg-background text-foreground min-h-screen antialiased overflow-x-hidden">
	<!-- Header -->
	<header
		class="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-md transition-all"
	>
		<div class="container mx-auto max-w-7xl px-6 py-4">
		<nav class="flex items-center justify-between">
			<a href="/" class="flex items-center gap-2 group">
				<div class="relative">
					<Camera class="h-7 w-7 transition-transform group-hover:scale-110" />
					<CheckCircle2 class="h-3 w-3 absolute -bottom-1 -right-1 text-green-500" />
				</div>
					<span class="font-bold text-lg  text-white">ProofInBio</span>					
			</a>
				<div class="flex items-center gap-3">
					<Button variant="ghost" size="sm" href="#how-it-works">How it Works</Button>
					<Button size="sm" onclick={() => authDialog.set({ open: true, mode: 'login' })}>
						Get Started
					</Button>
				</div>
			</nav>
			</div>
	</header>

	<!-- Main Content -->
	<main class="overflow-hidden">
		<!-- Hero Section -->
		<div class="container mx-auto max-w-7xl px-6">
			<section class="my-8 rounded-2xl overflow-hidden shadow-lg bg-white">
				<div class="md:grid md:grid-cols-2 md:h-[450px]">
					<!-- Text content on the left -->
					<div class="p-8 md:p-12 flex flex-col justify-center text-center md:text-left bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50">
						<div class="space-y-5 max-w-md mx-auto md:mx-0">
							<p class="text-lg font-medium tracking-widest uppercase text-stone-600">
								For Human Creators
							</p>
							<h1 class="text-4xl md:text-5xl font-bold tracking-tight text-balance text-gray-900">
								Made by people, not prompts.
							</h1>
							<p class="text-lg text-gray-600 text-balance">
								Upload real work. We verify it’s human, then we give you a link to prove it anywhere.
							</p>
							<div class="flex justify-center md:justify-start gap-4 pt-4">
								<Button
									size="lg"
									class="group text-white"
									onclick={() => authDialog.set({ open: true, mode: 'signup' })}
								>
									Create Your Gallery
									<ArrowRight class="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
								</Button>
							</div>
						</div>
					</div>
					<!-- Image on the right -->
					<div class="h-[300px] md:h-full">
						<img src="https://images.pexels.com/photos/9909233/pexels-photo-9909233.jpeg" alt="Person standing on a rock looking out over a misty mountain range" class="w-full h-full object-cover object-center" />
					</div>
				</div>
			</section>
		</div>

		<!-- Polaroid Scroll Section -->
		<!-- Wrapper with manual spacing to prevent pin overlap -->
		<div style="margin-bottom: 300vh;">
			<PolaroidScroll />
		</div>

		<!-- Essential Verification Section -->
		<section class="bg-blue p-0">
			<EssentialVerification/>
		</section>

		<!-- The Problem/Solution Section -->
		<ProblemSolution />

		<!-- How It Works Section -->
		<!-- Wrapper with manual spacing to prevent pin overlap -->
		<div style="margin-bottom: 180vh;">
			<HowItWorks />
		</div>
		
		

		<!-- Social Proof -->
		<section class="bg-muted/50 py-20">
			<div class="container mx-auto max-w-6xl px-6">
				<div class="text-center space-y-4 mb-12">
					<h2 class="text-3xl md:text-4xl font-bold ">
						For creators who value authenticity
					</h2>
				</div>

				<div class="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
					<Card class="p-6 space-y-4">
						<div class="flex gap-1">
							{#each Array.from({ length: 5 }, (_, i) => i) as i (i)}
								<Zap class="h-4 w-4 fill-amber-400 text-amber-400" />
							{/each}
						</div>
						<p class="text-sm">
							"Finally, a way to show my photography is actually mine. Game changer for client
							trust."
						</p>
						<div class="flex items-center gap-3">
							<img
								src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
								alt="Sarah Chen"
								class="h-8 w-8 rounded-full object-cover"
							/>
							<div>
								<p class="text-sm font-medium">Sarah Chen</p>
								<p class="text-xs text-muted-foreground">@sarahcaptures</p>
							</div>
						</div>
					</Card>

					<Card class="p-6 space-y-4">
						<div class="flex gap-1">
							{#each Array.from({ length: 5 }, (_, i) => i) as i (i)}
								<Zap class="h-4 w-4 fill-amber-400 text-amber-400" />
							{/each}
						</div>
						<p class="text-sm">
							"My illustrations stand out now. Collectors know they're getting authentic human art."
						</p>
						<div class="flex items-center gap-3">
							<img
								src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
								alt="Marcus Rodriguez"
								class="h-8 w-8 rounded-full object-cover"
							/>
							<div>
								<p class="text-sm font-medium">Marcus Rodriguez</p>
								<p class="text-xs text-muted-foreground">@marcusdraws</p>
							</div>
						</div>
					</Card>

					<Card class="p-6 space-y-4">
						<div class="flex gap-1">
							{#each Array.from({ length: 5 }, (_, i) => i) as i (i)}
								<Zap class="h-4 w-4 fill-amber-400 text-amber-400" />
							{/each}
						</div>
						<p class="text-sm">
							"Proof in Bio = instant credibility. My engagement went through the roof."
						</p>
						<div class="flex items-center gap-3">
							<img
								src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop"
								alt="Alex Kim"
								class="h-8 w-8 rounded-full object-cover"
							/>
							<div>
								<p class="text-sm font-medium">Alex Kim</p>
								<p class="text-xs text-muted-foreground">@alexshootsfilm</p>
							</div>
						</div>
					</Card>
				</div>
			</div>
		</section>

		<!-- Final CTA -->
		<section class="container mx-auto max-w-6xl px-6 py-20 md:py-28">
			<Card class="relative overflow-hidden">
				<div class="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 opacity-10"></div>
				<div class="relative p-12 md:p-16 text-center space-y-6">
					<h2 class="text-4xl md:text-5xl font-bold ">Prove it's human.</h2>
					<p class="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
						Join thousands of creators building trust with every upload. Free to start, powerful
						forever.
					</p>
					<div class="flex flex-col sm:flex-row gap-4 justify-center pt-4 ">
						<Button
							size="lg"
							class="group"
							onclick={() => authDialog.set({ open: true, mode: 'signup' })}
						>
							Create Your Gallery
							<ArrowRight class="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
						</Button>
						<Button size="lg" variant="outline">Learn About C2PA</Button>
					</div>
					<p class="text-sm text-muted-foreground">
						No credit card required • 50 photos free • 2-minute setup
					</p>
				</div>
			</Card>
		</section>
	</main>

	<!-- Footer -->
	<footer class="border-t">
		<div class="container mx-auto max-w-6xl px-6 py-12">
			<div class="grid md:grid-cols-4 gap-8">
				<div class="space-y-4">
					<div class="flex items-center gap-2">
						<Camera class="h-5 w-5 text-muted-foreground" />
						<span class="font-bold">Proof in Bio</span>
					</div>
					<p class="text-sm text-muted-foreground">The verified gallery for real creators.</p>
				</div>

				<div class="space-y-4">
					<h4 class="font-semibold">Product</h4>
					<ul class="space-y-2 text-sm text-muted-foreground">
						<li><a href="/features" class="hover:text-foreground">Features</a></li>
						<li><a href="/examples" class="hover:text-foreground">Examples</a></li>
					</ul>
				</div>

				<div class="space-y-4">
					<h4 class="font-semibold">Resources</h4>
					<ul class="space-y-2 text-sm text-muted-foreground">
						<li><a href="/c2pa" class="hover:text-foreground">What is C2PA?</a></li>
						<li>
							<a href="/supported-cameras" class="hover:text-foreground">Supported Cameras</a>
						</li>
						<li><a href="/help" class="hover:text-foreground">Help Center</a></li>
					</ul>
				</div>

				<div class="space-y-4">
					<h4 class="font-semibold">Company</h4>
					<ul class="space-y-2 text-sm text-muted-foreground">
						<li><a href="/about" class="hover:text-foreground">About</a></li>
						<li><a href="/blog" class="hover:text-foreground">Blog</a></li>
						<li><a href="/contact" class="hover:text-foreground">Contact</a></li>
					</ul>
				</div>
			</div>

			<div
				class="border-t mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground"
			>
				<p>&copy; {new Date().getFullYear()} Proof in Bio. All rights reserved.</p>
				<div class="flex gap-6 mt-4 sm:mt-0">
					<a href="/privacy" class="hover:text-foreground">Privacy</a>
					<a href="/terms" class="hover:text-foreground">Terms</a>
				</div>
			</div>
		</div>
	</footer>

	<!-- Auth Dialog -->
	<AuthDialog
		supabase={data.supabase}
		onclose={handleAuthClose}
		onsuccess={handleAuthSuccess}
	/>
</div>

<style>
	h1, h2 {
		font-family: 'Karma' !important;
	}
</style>
