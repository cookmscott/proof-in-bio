<script>
	import { Button } from '$lib/ui/button/index.js';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/ui/card/index.js';
	import { Input } from '$lib/ui/input/index.js';
	import { Label } from '$lib/ui/label/index.js';
	import { GalleryVerticalEnd } from 'lucide-svelte';

	let { data } = $props();

	let email = $state('');
	let password = $state('');
	let isLogin = $state(true);
	let i = Math.floor(Math.random() * 1000);

	async function handleGoogleSignIn() {
		await data.supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: `${window.location.origin}/auth/callback`,
			},
		});
	}
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
				
				<Button variant="outline" class="w-full flex items-center justify-center gap-2"
					type="button"
					onclick={handleGoogleSignIn}
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="size-5">
						<path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor" />
					</svg>
					{isLogin ? 'Login with Google' : 'Continue with Google'}
				</Button>
				<div class="text-center text-sm">
					{isLogin ? "Don't have an account?" : "Already have an account?"}
					<button
						type="button"
						class="text-primary hover:underline"
						onclick={() => isLogin = !isLogin}
					>
						{isLogin ? 'Sign up' : 'Login'}
					</button>
				</div>
			</CardContent>
		</Card>
	</div>
</div>
