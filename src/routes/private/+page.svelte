<script>
	import { goto } from '$app/navigation';
	import { Button } from '$lib/ui/button/index.js';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/ui/card/index.js';
	import { LogOut, Shield } from 'lucide-svelte';

	let { data } = $props();

	async function signOut() {
		await data.supabase.auth.signOut();
		goto('/');
	}
</script>

<div class="container mx-auto max-w-4xl px-6 py-8">
	<div class="flex items-center justify-between mb-8">
		<h1 class="text-3xl font-bold">Private Dashboard</h1>
		<Button on:click={signOut} variant="outline" class="gap-2">
			<LogOut class="size-4" />
			Sign Out
		</Button>
	</div>

	<Card>
		<CardHeader>
			<CardTitle class="flex items-center gap-2">
				<Shield class="size-5 text-green-600" />
				Welcome to your private area!
			</CardTitle>
			<CardDescription>
				This is a protected route that requires authentication.
			</CardDescription>
		</CardHeader>
		<CardContent>
			{#if data.user}
				<p class="text-sm text-muted-foreground">
					Logged in as: <span class="font-medium">{data.user.email}</span>
				</p>
				<p class="text-sm text-muted-foreground mt-2">
					User ID: <span class="font-mono text-xs">{data.user.id}</span>
				</p>
			{/if}
		</CardContent>
	</Card>
</div>
