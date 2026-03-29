<script>
	import { Camera } from 'lucide-svelte';
</script>

<footer class="border-t">
	<div class="container mx-auto max-w-5xl px-6 py-12">
		<div class="grid md:grid-cols-4 gap-8">
			<div class="space-y-4">
				<div class="flex items-center gap-2">
					<Camera class="h-5 w-5 text-muted-foreground" />
					<span class="font-bold">Proof in Bio</span>
				</div>
				<p class="text-sm text-muted-foreground">
					Proof pages for photographers who need provenance people can verify.
				</p>
			</div>

			<div class="space-y-4">
				<h4 class="font-semibold">Product</h4>
				<ul class="space-y-2 text-sm text-muted-foreground">
					<li><a href="/examples" class="hover:text-foreground">Example Proof Page</a></li>
					<li><a href="/features" class="hover:text-foreground">Features</a></li>
				</ul>
			</div>

			<div class="space-y-4">
				<h4 class="font-semibold">Resources</h4>
				<ul class="space-y-2 text-sm text-muted-foreground">
					<li><a href="/c2pa" class="hover:text-foreground">What is C2PA?</a></li>
					<li><a href="/supported-cameras" class="hover:text-foreground">Supported Devices</a></li>
					<li><a href="/help" class="hover:text-foreground">FAQ</a></li>
				</ul>
			</div>

			<div class="space-y-4">
				<h4 class="font-semibold">Company</h4>
				<ul class="space-y-2 text-sm text-muted-foreground">
					<li><a href="/privacy" class="hover:text-foreground">Privacy</a></li>
					<li><a href="/terms" class="hover:text-foreground">Terms</a></li>
					<li><a href="/contact" class="hover:text-foreground">Contact</a></li>
				</ul>
			</div>
		</div>

		<div
			class="border-t mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground"
		>
			<p>&copy; {new Date().getFullYear()} Proof in Bio. All rights reserved.</p>
			<div class="flex gap-6 mt-4 sm:mt-0">
				<a href="/about" class="hover:text-foreground">About</a>
				<a href="/blog" class="hover:text-foreground">Blog</a>
			</div>
		</div>
	</div>
</footer>
