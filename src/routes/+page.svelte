<!--
  +page.svelte
  Landing page for Proof in Bio - a C2PA-verified photo platform
  Updated aesthetic: Cinematic realism with emotional grit.
-->
<script>
	import AuthDialog from '$lib/components/auth-dialog.svelte';
	import LandingHeader from '$lib/components/landing/LandingHeader.svelte';
	import LandingHero from '$lib/components/landing/LandingHero.svelte';
	import LandingPolaroidScroll from '$lib/components/landing/LandingPolaroidScroll.svelte';
	import LandingInstaCompare from '$lib/components/landing/LandingInstaCompare.svelte';
	import LandingEssentialVerification from '$lib/components/landing/LandingEssentialVerification.svelte';
	import LandingProblemSolution from '$lib/components/landing/LandingProblemSolution.svelte';
	import LandingHowItWorks from '$lib/components/landing/LandingHowItWorks.svelte';
	import SocialProof from '$lib/components/landing/SocialProof.svelte';
	import LandingFinalCta from '$lib/components/landing/LandingFinalCta.svelte';
	import LandingFooter from '$lib/components/landing/LandingFooter.svelte';

	// Get data from layout (includes supabase client)
	let { data } = $props();

	// Auth dialog state
	let showAuthDialog = $state(false);

	function handleAuthSuccess(event) {
		console.log('User authenticated:', event.detail);
		showAuthDialog = false;
		// User will be automatically redirected by the dialog
	}

	function handleAuthClose() {
		showAuthDialog = false;
	}
</script>

<div class="bg-background text-foreground min-h-screen antialiased overflow-x-hidden">
	<!-- Header -->
	<LandingHeader onAuthRequest={() => (showAuthDialog = true)} />

	<!-- Main Content -->
	<main class="overflow-hidden">
		<!-- Hero Section -->
		<LandingHero onAuthRequest={() => (showAuthDialog = true)} />

		<!-- Polaroid Scroll Section -->
		<LandingPolaroidScroll />

		<!-- Instagram Comparison Real vs Fake -->
		<LandingInstaCompare />

		<!-- Essential Verification Section -->
		<LandingEssentialVerification />

		<!-- The Problem/Solution Section -->
		<LandingProblemSolution />

		<!-- How It Works Section -->
		<LandingHowItWorks />

		<!-- Social Proof -->
		<SocialProof />

		<!-- Final CTA -->
		<LandingFinalCta onAuthRequest={() => (showAuthDialog = true)} />
	</main>

	<!-- Footer -->
	<LandingFooter />

	<!-- Auth Dialog -->
	<AuthDialog
		supabase={data.supabase}
		open={showAuthDialog}
		onclose={handleAuthClose}
		onsuccess={handleAuthSuccess}
	/>
</div>

<style>
	h1,
	h2 {
		font-family: 'Karma' !important;
	}
</style>
