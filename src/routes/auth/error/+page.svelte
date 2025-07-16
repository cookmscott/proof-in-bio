<script>
	import { Button } from '$lib/components/ui/button/index.js';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
	import { AlertTriangle } from 'lucide-svelte';
</script>

<div class="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
	<div class="flex w-full max-w-sm flex-col gap-6">
		<Card>
			<CardHeader>
				<CardTitle class="flex items-center gap-2">
					<AlertTriangle class="size-5 text-destructive" />
					Authentication Error
				</CardTitle>
				<CardDescription>
					There was an error with your authentication. Please try again.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Button href="/auth" class="w-full">
					Try Again
				</Button>
			</CardContent>
		</Card>
	</div>
</div>
