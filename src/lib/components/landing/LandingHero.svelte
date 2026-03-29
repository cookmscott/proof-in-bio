<script>
	import { Button } from '$lib/ui/button/index.js';
	import { ArrowRight } from 'lucide-svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	export let onAuthRequest = () => {};

	function handleStartFree() {
		if ($page.data.session) {
			const username = $page.data.session.user?.user_metadata?.username;
			goto(username ? `/${username}` : '/profile');
		} else {
			onAuthRequest();
		}
	}
</script>

<div class="container mx-auto max-w-5xl px-6">
	<section class="my-8 rounded-2xl overflow-hidden shadow-lg bg-white">
		<div
			class="bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 px-8 py-14 text-center md:px-12 md:py-20"
		>
			<div class="mx-auto max-w-4xl space-y-6">
				<h1 class="text-4xl font-bold tracking-tight text-balance text-zinc-900 md:text-6xl">
					When platforms strip metadata, your proof still has a home.
				</h1>
				<p class="mx-auto max-w-3xl text-lg leading-8 text-zinc-600 text-balance md:text-xl">
					Social platforms flatten the evidence behind your work. Proof in Bio gives photographers a
					permanent proof page they can send to editors, collectors, and clients anywhere.
				</p>
				<div class="flex flex-col items-center justify-center gap-4 pt-2 sm:flex-row">
					<Button size="lg" class="group text-white font-bold" onclick={handleStartFree}>
						Start Free
						<ArrowRight class="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
					</Button>
					<Button size="lg" variant="outline" href="/examples">See Example Proof Page</Button>
				</div>
				<p class="text-sm font-medium text-stone-600">
					No credit card required &middot; 50 photos free &middot; 2-minute setup
				</p>
			</div>
		</div>
	</section>
</div>
