<script>
	import { ShieldCheck } from 'lucide-svelte';
	import { Upload } from 'lucide-svelte';
	import { Link2 } from 'lucide-svelte';
	import DetectiveRobot from '$lib/components/DetectiveRobot.svelte';

	const steps = [
		{
			icon: Upload,
			title: 'Upload signed image',
			description: 'Upload a photo containing C2PA Content Credentials from a supported camera or editing tool.',
			image: 'https://images.pexels.com/photos/3762375/pexels-photo-3762375.jpeg?w=800',
			color: '#E9ECED'
		},
		{
			icon: ShieldCheck,
			title: 'Verify authenticity',
			description: "We validate the digital signature to ensure the image hasn't been manipulated.",
			image: 'https://images.pexels.com/photos/8090132/pexels-photo-8090132.jpeg?w=800',
			color: '#FFFCEB'
		},
		{
			icon: Link2,
			title: 'Share verified link',
			description: 'Receive a trusted URL for your bio or portfolio that proves your content is authentic.',
			image: 'https://images.pexels.com/photos/1540338/pexels-photo-1540338.jpeg?w=800',
			color: '#ECF9FD'
		}
	];
</script>

<section id="how-it-works" class="relative py-24 bg-secondary/20">
	<div class="container mx-auto px-6">
		<div class="text-center max-w-3xl mx-auto mb-16">
			<h2 class="text-3xl md:text-4xl font-bold tracking-tight mb-4">How It Works</h2>
			<p class="text-lg text-muted-foreground">
				Secure your content in three simple steps.
			</p>
		</div>

		<div class="grid md:grid-cols-3 gap-8 lg:gap-12">
			{#each steps as step, i}
				<div class="flex flex-col">
					<!-- Visual Card -->
					<div class="relative rounded-2xl overflow-hidden shadow-lg aspect-square w-full bg-background mb-6 group">
						<img
							src={step.image}
							alt={step.title}
							class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
						/>
						<div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
						
						<!-- Robot Overlay for Step 2 -->
						{#if i === 1}
							<div class="absolute inset-0 z-100 pointer-events-none">
								<!-- Container to center and scale the robot -->
								<div class="w-full h-full flex items-center justify-center transform scale-110 origin-center">
									<DetectiveRobot />
								</div>
							</div>
						{/if}

						<!-- Icon Badge -->
						<div class="absolute top-4 right-4 z-10">
							<div class="h-10 w-10 rounded-xl bg-background/90 backdrop-blur shadow border border-white/20 flex items-center justify-center text-primary">
								<svelte:component this={step.icon} size={20} />
							</div>
						</div>
						
						<!-- C2PA Pill -->
						<div class="absolute bottom-4 left-4 z-10">
							<div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/80 backdrop-blur border border-white/20 text-[10px] font-medium text-foreground uppercase tracking-wider">
								<span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
								C2PA
							</div>
						</div>
					</div>

					<!-- Text Content -->
					<div>
						<p class="text-sm font-mono uppercase tracking-widest text-primary mb-2">
							Step 0{i + 1}
						</p>
						<h3 class="text-2xl font-semibold leading-tight text-foreground mb-3">
							{step.title}
						</h3>
						<p class="text-muted-foreground leading-relaxed">
							{step.description}
						</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
