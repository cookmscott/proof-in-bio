<script>
	import {
		CheckCircle2,
		ShieldCheck,
		Sparkles,
		XCircle,
	} from 'lucide-svelte';
</script>

<section class="py-20 md:py-28">
			<div class="container mx-auto max-w-6xl px-6">
				<div class="grid md:grid-cols-2 gap-16 items-center">
					<!-- The Problem -->
					<div class="space-y-6">
						<div class="inline-flex items-center gap-2 text-destructive">
							<XCircle class="h-5 w-5" />
							<span class="font-semibold">The Problem</span>
						</div>
						<h2 class="text-3xl md:text-4xl font-bold ">
							Nobody knows what's real anymore
						</h2>
						<div class="space-y-4 text-muted-foreground">
							<div class="flex gap-3">
								<Sparkles class="h-5 w-5 mt-0.5 text-destructive/50" />
								<p>AI-generated images flooding every platform</p>
							</div>
							<div class="flex gap-3">
								<Sparkles class="h-5 w-5 mt-0.5 text-destructive/50" />
								<p>Heavy filters and edits destroying authenticity</p>
							</div>
							<div class="flex gap-3">
								<Sparkles class="h-5 w-5 mt-0.5 text-destructive/50" />
								<p>No way to verify if a photo is genuinely human-made</p>
							</div>
						</div>
					</div>

					<!-- The Solution -->
					<div class="space-y-6">
						<div class="inline-flex items-center gap-2 text-primary">
							<ShieldCheck class="h-5 w-5" />
							<span class="font-semibold">The Solution</span>
						</div>
						<h2 class="text-3xl md:text-4xl font-bold ">One link that proves it all</h2>
						<div class="space-y-4">
							<div class="flex gap-3">
								<CheckCircle2 class="h-5 w-5 mt-0.5 text-green-500" />
								<div>
									<p class="font-medium">C2PA verification on every upload</p>
									<p class="text-sm text-muted-foreground">Industry-standard cryptographic proof</p>
								</div>
							</div>
							<div class="flex gap-3">
								<CheckCircle2 class="h-5 w-5 mt-0.5 text-green-500" />
								<div>
									<p class="font-medium">Beautiful gallery you control</p>
									<p class="text-sm text-muted-foreground">Your verified work, your way</p>
								</div>
							</div>
							<div class="flex gap-3">
								<CheckCircle2 class="h-5 w-5 mt-0.5 text-green-500" />
								<div>
									<p class="font-medium">Drop it in your bio anywhere</p>
									<p class="text-sm text-muted-foreground">
										Instagram, Twitter, LinkedIn - prove it everywhere
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
