<!--
  +page.svelte
  Landing page for Proof in Bio - a C2PA-verified photo platform
  Updated aesthetic: Cinematic realism with emotional grit.
-->
<script>
	import { authDialog } from '$lib/stores/auth';
	import LandingHeader from '$lib/components/landing/LandingHeader.svelte';
	import LandingHero from '$lib/components/landing/LandingHero.svelte';
	import LandingPolaroidScroll from '$lib/components/landing/LandingPolaroidScroll.svelte';
	import LandingInstaCompare from '$lib/components/landing/LandingInstaCompare.svelte';
	import LandingC2PAPhotos from '$lib/components/landing/LandingC2PAPhotos.svelte';
	import LandingEssentialVerification from '$lib/components/landing/LandingEssentialVerification.svelte';
	import LandingCompatibility from '$lib/components/landing/LandingCompatibility.svelte';
	import LandingHowItWorks from '$lib/components/landing/LandingHowItWorks.svelte';
	import SocialProof from '$lib/components/landing/SocialProof.svelte';
	import LandingFinalCta from '$lib/components/landing/LandingFinalCta.svelte';
	import LandingFooter from '$lib/components/landing/LandingFooter.svelte';

	// Get data from layout (includes supabase client)
	let { data } = $props();
	
	function openAuth() {
		authDialog.set({ open: true, mode: 'login' });
	}
</script>

<div class="landing-page bg-background text-foreground min-h-screen antialiased overflow-x-hidden">
	<!-- Header -->
	<LandingHeader 
		session={data.session} 
		user={data.user} 
		supabase={data.supabase} 
	/>

	<!-- Main Content -->
	<main class="overflow-hidden">
		<!-- Hero Section -->
		<LandingHero onAuthRequest={openAuth} />

		<!-- Polaroid Scroll Section 
		<LandingPolaroidScroll /> -->

		<!-- Instagram Comparison Real vs Fake -->
		<LandingInstaCompare />

		<!-- C2PA Photos Section -->
		<LandingC2PAPhotos />


		<!-- Essential Verification Section -->
		<LandingEssentialVerification />

		<!-- Supported Devices Section -->
		<LandingCompatibility />

		<!-- How It Works Section -->
		<LandingHowItWorks />

		<!-- Social Proof -->
		<SocialProof />

		<!-- Final CTA -->
		<LandingFinalCta onAuthRequest={openAuth} />
	</main>

	<!-- Footer -->
	<LandingFooter />
</div>

<style>
	:global(.landing-page h1),
	:global(.landing-page h2),
	:global(.landing-page h3),
	:global(.landing-page h4),
	:global(.landing-page h5),
	:global(.landing-page h6) {
		font-family: 'Sentient', serif !important;
	}
</style>
