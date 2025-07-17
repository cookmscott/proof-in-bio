<script>
	import { Button } from '$lib/ui/button/index.js';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/ui/card/index.js';
	import { Input } from '$lib/ui/input/index.js';
	import { Label } from '$lib/ui/label/index.js';
	import { GalleryVerticalEnd } from 'lucide-svelte';

	let email = '';
	let password = '';
	let isLogin = true;
	let i = Math.floor(Math.random() * 1000);
</script>

<div class="relative bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10"
	style="background-image: url('https://picsum.photos/1200/1200?random={i}'); background-size: cover; background-position: center;"
>
	<!-- Dark overlay -->
	<div class="absolute inset-0 bg-black/50 pointer-events-none z-0"></div>
	<div class="relative z-10 flex w-full max-w-sm flex-col gap-6">
		<a href="/" class="flex items-center gap-2 self-center font-medium">
			<div class="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
				<GalleryVerticalEnd class="size-4" />
			</div>
			Proof in Bio
		</a>
		
		<Card>
			<CardHeader>
				<CardTitle>{isLogin ? 'Login' : 'Sign Up'}</CardTitle>
				<CardDescription>
					{isLogin ? 'Enter your email and password to login' : 'Create a new account'}
				</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<form method="post" action="?/{isLogin ? 'login' : 'signup'}" class="space-y-4">
					<div class="space-y-2">
						<Label for="email">Email</Label>
						<Input
							id="email"
							name="email"
							type="email"
							placeholder="m@example.com"
							bind:value={email}
							required
						/>
					</div>
					<div class="space-y-2">
						<Label for="password">Password</Label>
						<Input
							id="password"
							name="password"
							type="password"
							bind:value={password}
							required
						/>
					</div>
					<Button type="submit" class="w-full">
						{isLogin ? 'Login' : 'Sign Up'}
					</Button>
				</form>
				
				<div class="text-center text-sm">
					{isLogin ? "Don't have an account?" : "Already have an account?"}
					<button
						type="button"
						class="text-primary hover:underline"
						on:click={() => isLogin = !isLogin}
					>
						{isLogin ? 'Sign up' : 'Login'}
					</button>
				</div>
			</CardContent>
		</Card>
	</div>
</div>
