# Auth Dialog Usage Example

Your `AuthDialog` component is now fully self-contained and can be used from any page or component.

## How to use on any page:

```svelte
<script>
  import AuthDialog from '$lib/components/auth-dialog.svelte';
  import { Button } from '$lib/ui/button/index.js';
  
  let { data } = $props(); // Get supabase from layout
  let showAuthDialog = $state(false);

  function handleAuthSuccess(event) {
    console.log('User authenticated:', event.detail);
    showAuthDialog = false;
    // Redirect or show success message
  }

  function handleAuthClose() {
    showAuthDialog = false;
  }
</script>

<!-- Your landing page content -->
<main>
  <h1>Welcome to Proof in Bio</h1>
  <p>Your amazing landing page content...</p>
  
  <!-- Login button -->
  <Button onclick={() => showAuthDialog = true}>
    Login / Sign Up
  </Button>
</main>

<!-- Auth dialog (shows when needed) -->
<AuthDialog 
  supabase={data.supabase}
  open={showAuthDialog}
  onclose={handleAuthClose}
  onsuccess={handleAuthSuccess}
/>
```

## Features:

✅ **Self-contained**: All auth logic is in the component
✅ **Supabase integration**: Direct client-side auth with proper error handling  
✅ **Email/Password auth**: Login and signup flows
✅ **OAuth support**: Google sign-in (Apple/Meta buttons ready for configuration)
✅ **Error handling**: Shows auth errors to user
✅ **Loading states**: Disables buttons during requests
✅ **Navigation**: Auto-redirects after successful login
✅ **Events**: Dispatches success/close events for parent handling
✅ **Responsive**: Works on mobile and desktop
✅ **Accessibility**: Proper ARIA labels and keyboard navigation

## Props:

- `supabase` (required): The Supabase client from your layout
- `open` (optional): Controls dialog visibility (default: true)

## Events:

- `success`: Fired when auth succeeds, includes event.detail with auth type
- `close`: Fired when user closes the dialog

The component handles all server communication via the Supabase client, so you don't need separate API routes for basic auth operations.
