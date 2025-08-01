<script>
import AuthDialog from '$lib/components/auth-dialog.svelte';

let { data } = $props();
let showDialog = $state(true);

function handleClose() {
	showDialog = false;
}

function handleSuccess(event) {
	console.log('Auth success:', event.detail);
	showDialog = false;
}
</script>

<div class="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
	<AuthDialog 
		supabase={data.supabase} 
		open={showDialog}
		onclose={handleClose}
		onsuccess={handleSuccess}
	/>
	
	{#if !showDialog}
		<div class="text-center">
			<p class="text-muted-foreground mb-4">Dialog closed</p>
			<button 
				class="underline text-primary" 
				onclick={() => showDialog = true}
			>
				Reopen Auth Dialog
			</button>
		</div>
	{/if}
	
	<div class="text-muted-foreground *:[a]:hover:text-primary *:[a]:underline *:[a]:underline-offset-4 text-balance text-center text-xs mt-4">
		By clicking continue, you agree to our
		<a href="##">Terms of Service</a> and <a href="##">Privacy Policy</a>.
	</div>
</div>
