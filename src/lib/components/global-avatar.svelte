<script>
import { Avatar, AvatarImage, AvatarFallback } from '$lib/components/ui/avatar/index.js';
import { Button } from '$lib/components/ui/button/index.js';
import { page } from '$app/stores';
import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
import { supabase } from '$lib/supabaseClient';
import { goto } from '$app/navigation';

// Props from layout
export let session = null;
export let user = null;

// Hide on auth pages
$: isAuthPage = $page.route.id?.includes('/auth') || $page.route.id?.includes('/login') || $page.route.id?.includes('/signup');

// Get user data from Supabase user object
$: avatarUrl = user?.user_metadata?.avatar_url || user?.avatar_url || '';
$: displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'User';
$: initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase();

import { get } from 'svelte/store';

async function handleLogout() {
	const { error } = await supabase.auth.signOut();
	if (error) {
		// Optionally show an error notification here
		console.error('Logout failed:', error.message);
		return;
	}
	// Optionally, you can clear user/session state here if needed
	// If session/user are passed as props from a parent, ensure parent updates them on logout
	goto('/auth');
}
</script>

{#if !isAuthPage}
	<div class="fixed top-4 right-4 z-50">
		{#if session && user}
			<DropdownMenu.Root>
				<DropdownMenu.Trigger asChild>
					<Avatar class="h-10 w-10 cursor-pointer">
						{#if avatarUrl}
							<AvatarImage src={avatarUrl} alt={displayName} />
						{:else}
							<AvatarFallback>{initials}</AvatarFallback>
						{/if}
					</Avatar>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end" class="w-56">
					<DropdownMenu.Group>
						<DropdownMenu.Label>My Account</DropdownMenu.Label>
						<DropdownMenu.Separator />
						<DropdownMenu.Item asChild>
							<a href="/profile">Profile</a>
						</DropdownMenu.Item>
						<DropdownMenu.Item asChild>
							<a href="/billing">Billing</a>
						</DropdownMenu.Item>
						<DropdownMenu.Item asChild>
							<a href="/team">Team</a>
						</DropdownMenu.Item>
						<DropdownMenu.Item asChild>
							<a href="/subscription">Subscription</a>
						</DropdownMenu.Item>
						<DropdownMenu.Separator />
						<DropdownMenu.Item on:select={handleLogout} class="text-red-600 cursor-pointer">
							Logout
						</DropdownMenu.Item>
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		{:else}
			<Button href="/auth" variant="outline">Login</Button>
		{/if}
	</div>
{/if}