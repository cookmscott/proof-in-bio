<script>
	import { Avatar, AvatarImage, AvatarFallback } from '$lib/ui/avatar/index.js';
	import { Button } from '$lib/ui/button/index.js';
	import { page } from '$app/stores';
	import * as DropdownMenu from '$lib/ui/dropdown-menu/index.js';
	import AuthDialog from '$lib/components/auth-dialog.svelte';
	import { goto, invalidate } from '$app/navigation';
	import { User, CreditCard, Users, Package, LogOut } from 'lucide-svelte';

	// Props from layout
	let { session = null, user = null, supabase = null } = $props();

	// Fetch username for profile link
	let username = $state(null);

	$effect(() => {
		if (user && supabase) {
			// Fetch the username from user_profiles
			supabase
				.from('user_profiles')
				.select('username')
				.eq('id', user.id)
				.single()
				.then(({ data }) => {
					username = data?.username;
				});
		}
	});

	// Fix: Prevent body overflow and paddingRight from being set by dropdown (if any)
	$effect(() => {
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

	// Auth dialog state
	let showAuthDialog = $state(false);

	function handleAuthSuccess(event) {
		console.log('User authenticated:', event.detail);
		showAuthDialog = false;
		// User will be automatically redirected by the dialog
	}

	function handleAuthClose() {
		showAuthDialog = false;
	}

	// Hide on auth pages
	let isAuthPage = $derived($page.route.id?.includes('/auth'));

	// Get user data from Supabase user object
	let avatarUrl = $derived(user?.user_metadata?.avatar_url || user?.avatar_url || '');
	let displayName = $derived(
		user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'User'
	);
	let initials = $derived(
		displayName
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
	);

	async function handleLogout() {
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
							<a href={username ? `/profile/${username}` : '/profile'} class="flex items-center">
								<User class="w-4 h-4 mr-2" />
								Profile
							</a>
						</DropdownMenu.Item>
						<DropdownMenu.Item asChild>
							<a href="/billing" class="flex items-center">
								<CreditCard class="w-4 h-4 mr-2" />
								Billing
							</a>
						</DropdownMenu.Item>
						<DropdownMenu.Item asChild>
							<a href="/team" class="flex items-center">
								<Users class="w-4 h-4 mr-2" />
								Team
							</a>
						</DropdownMenu.Item>
						<DropdownMenu.Item asChild>
							<a href="/subscription" class="flex items-center">
								<Package class="w-4 h-4 mr-2" />
								Subscription
							</a>
						</DropdownMenu.Item>
						<DropdownMenu.Separator />
						<DropdownMenu.Item asChild>
							<button
								type="button"
								class="cursor-pointer w-full text-left flex items-center"
								onclick={handleLogout}
							>
								<LogOut class="w-4 h-4 mr-2" />
								Logout
							</button>
						</DropdownMenu.Item>
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		{:else}
			<Button variant="outline" onclick={() => (showAuthDialog = true)}>Login</Button>
		{/if}
	</div>
{/if}

<!-- Auth Dialog -->
<AuthDialog
	{supabase}
	open={showAuthDialog}
	onclose={handleAuthClose}
	onsuccess={handleAuthSuccess}
/>
