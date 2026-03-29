<script>
	import { Button } from '$lib/ui/button/index.js';
	import { ArrowRight } from 'lucide-svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	export let onAuthRequest = () => {};

	function handleCtaClick() {
		if ($page.data.session) {
			const username = $page.data.session.user?.user_metadata?.username;
			goto(username ? `/${username}` : '/profile');
		} else {
			onAuthRequest();
		}
	}
</script>

<div class="container mx-auto max-w-5xl px-6">
	<section class="my-8 rounded-2xl overflow-hidden border border-border/70 bg-card shadow-lg">
		<div class="px-8 py-14 text-center md:px-12 md:py-20" style="background: #fefcf6;">
			<div class="mx-auto max-w-3xl space-y-6">
				<h1 class="text-4xl font-bold tracking-tight text-balance text-foreground md:text-6xl">
					When platforms strip metadata, your proof still has a home.
				</h1>
				<p class="mx-auto max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
					Proof in Bio gives photographers a permanent proof page they can send to editors,
					collectors, and clients anywhere.
				</p>
				<div class="flex flex-col items-center gap-4 pt-2">
					<Button size="lg" class="group text-white font-bold" onclick={handleCtaClick}>
						Create Your Verified Gallery
						<ArrowRight class="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
					</Button>
					<p class="text-sm font-medium text-muted-foreground">
						No credit card required &middot; 50 photos free &middot; 2-minute setup
					</p>
				</div>
			</div>
		</div>
	</section>
</div>
