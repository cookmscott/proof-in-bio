<script>
	import { Camera } from 'lucide-svelte';
</script>

<footer class="border-t">
	<div class="container mx-auto max-w-6xl px-6 py-12">
		<div class="grid md:grid-cols-4 gap-8">
			<div class="space-y-4">
				<div class="flex items-center gap-2">
					<Camera class="h-5 w-5 text-muted-foreground" />
					<span class="font-bold">Proof in Bio</span>
				</div>
				<p class="text-sm text-muted-foreground">The proof gallery for real creators.</p>
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
