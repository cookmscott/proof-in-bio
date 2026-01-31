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
						Upload real work. We verify it’s human, then we give you a link to prove it
						anywhere.
					</p>
					<div class="flex justify-center md:justify-start gap-4 pt-4">
						<Button size="lg" class="group text-white" onclick={handleCtaClick}>
							Create Your Gallery
							<ArrowRight
								class="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
							/>
						</Button>
					</div>
				</div>
			</div>
			<!-- Image on the right -->
			<div class="h-[300px] md:h-full">
				<img
					src="https://images.pexels.com/photos/9909233/pexels-photo-9909233.jpeg"
					alt="Person standing on a rock looking out over a misty mountain range"
					class="w-full h-full object-cover object-center"
				/>
			</div>
		</div>
	</section>
</div>
