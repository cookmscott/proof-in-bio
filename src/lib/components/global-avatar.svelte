<script>
import { Avatar, AvatarImage, AvatarFallback } from '$lib/ui/avatar/index.js';
import { Button } from '$lib/ui/button/index.js';
import { page } from '$app/stores';
import * as DropdownMenu from "$lib/ui/dropdown-menu/index.js";
import { onMount } from 'svelte';
import { goto, invalidate } from '$app/navigation';
import { get } from 'svelte/store';

// Example icons, replace with your icon components or SVGs
const ProfileIcon = `<svg class="w-4 h-4 mr-2 inline-block" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 8-4 8-4s8 0 8 4"/></svg>`;
const BillingIcon = `<svg class="w-4 h-4 mr-2 inline-block" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3v4"/><path d="M8 3v4"/></svg>`;
const TeamIcon = `<svg class="w-4 h-4 mr-2 inline-block" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a7.5 7.5 0 0 1 13 0"/></svg>`;
const SubscriptionIcon = `<svg class="w-4 h-4 mr-2 inline-block" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/></svg>`;
const LogoutIcon = `<svg class="w-4 h-4 mr-2 inline-block" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7"/><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/></svg>`;

// Fix: Prevent body overflow and paddingRight from being set by dropdown (if any)
onMount(() => {
  const observer = new MutationObserver(() => {
    if (document.body.style.overflow === 'hidden') {
      document.body.style.overflow = '';
    }
    if (document.body.style.paddingRight) {
      document.body.style.paddingRight = '';
    }
  });
  observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });
  return () => observer.disconnect();
});
// Props from layout
export let session = null;
export let user = null;
export let supabase = null;

// Hide on auth pages
$: isAuthPage = $page.route.id?.includes('/auth');

// Get user data from Supabase user object
$: avatarUrl = user?.user_metadata?.avatar_url || user?.avatar_url || '';
$: displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'User';
$: initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase();

async function handleLogout() {
	console.log('Logging out...');
	try {
		// Ensure supabase client is available
		if (!supabase) {
			console.error('Supabase client not available');
			return;
		}

		// Sign out with global scope (terminates all sessions for the user)
		const { error } = await supabase.auth.signOut({ scope: 'global' });
		
		if (error) {
			console.error('Logout failed:', error.message);
			// Optionally show user-friendly error notification here
			return;
		}

		// Invalidate the auth state to trigger a re-fetch of session data
		await invalidate('supabase:auth');
		
		// Navigate to auth page
		goto('/auth');
	} catch (err) {
		console.error('Logout error:', err);
	}
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
				   <a href="/profile"><span>{@html ProfileIcon}</span>Profile</a>
			   </DropdownMenu.Item>
			   <DropdownMenu.Item asChild>
				   <a href="/billing"><span>{@html BillingIcon}</span>Billing</a>
			   </DropdownMenu.Item>
			   <DropdownMenu.Item asChild>
				   <a href="/team"><span>{@html TeamIcon}</span>Team</a>
			   </DropdownMenu.Item>
			   <DropdownMenu.Item asChild>
				   <a href="/subscription"><span>{@html SubscriptionIcon}</span>Subscription</a>
			   </DropdownMenu.Item>
						<DropdownMenu.Separator />
			   <DropdownMenu.Item asChild>
	<button type="button" class="cursor-pointer w-full text-left flex items-center" on:click={handleLogout}>
		<span>{@html LogoutIcon}</span>Logout
	</button>
</DropdownMenu.Item>
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		{:else}
			<Button href="/auth" variant="outline">Login</Button>
		{/if}
	</div>
{/if}