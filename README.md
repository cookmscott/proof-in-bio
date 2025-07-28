# Proof in Bio

This project uses [SvelteKit](https://kit.svelte.dev) with components from [shadcn-svelte](https://github.com/shadcn-ui/ui). It requires a Supabase backend for authentication.

## Getting Started

1. Install dependencies
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and provide your `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` values.
3. Start the development server
   ```bash
   npm run dev
   ```

## Authentication Flow

This app implements a secure server-side authentication flow using Supabase Auth with both email/password and Google OAuth support. The architecture follows SvelteKit SSR best practices for security and performance.

### Flow Overview

1. **Client Authentication Request** → User submits credentials or clicks OAuth button
2. **Server-Side Processing** → SvelteKit handles auth via Supabase server client
3. **Session Management** → Sessions stored as secure HTTP-only cookies
4. **Route Protection** → Server-side guards protect authenticated routes

### File Structure & Responsibilities

#### Frontend (Client-Side)
- **`src/routes/auth/+page.svelte`** - Login/signup UI with form handling
  - Email/password forms submit to server actions
  - Google OAuth button triggers `signInWithOAuth()` redirect
  - Uses Svelte 5 runes (`$state`, `onclick`) for reactivity
  - Gets Supabase client from layout data (secure SSR client)

#### Backend (Server-Side)
- **`src/routes/auth/+page.server.js`** - Form action handlers
  - `login` action: Processes email/password login
  - `signup` action: Processes email/password registration
  - Uses server-side Supabase client for secure auth operations

- **`src/routes/auth/callback/+server.js`** - OAuth callback handler
  - Receives authorization code from Google OAuth redirect
  - Exchanges code for session using `exchangeCodeForSession()`
  - Sets secure session cookies and redirects user
  - Handles OAuth errors with proper error pages

#### Core Infrastructure
- **`src/lib/server/supabase.js`** - Server-side Supabase configuration
  - `createSupabaseServer()`: Creates SSR-compatible client with cookie handling
  - `safeGetSession()`: Safely retrieves and validates user sessions
  - Handles cookie-based session management for SSR

- **`src/routes/+layout.server.js`** - Global session management
  - Runs on every request to check authentication state
  - Provides session data to all pages via layout data
  - Ensures consistent auth state across the app

- **`src/routes/+layout.js`** - Client-side Supabase setup
  - Creates browser/server Supabase clients based on environment
  - Handles session synchronization between server and client
  - Provides reactive auth state to components

- **`src/hooks.server.js`** - Request-level auth setup
  - Initializes Supabase for each incoming request
  - Attaches auth client to `locals` for use in load functions
  - Handles route-level authentication guards

#### Protected Routes
- **`src/routes/private/+layout.server.js`** - Protected route guard
  - Validates authentication before serving protected pages
  - Redirects unauthenticated users to login
  - Ensures server-side session validation

### Security Features

1. **Server-Side Session Validation** - All auth checks happen server-side
2. **HTTP-Only Cookies** - Session tokens not accessible via JavaScript
3. **PKCE Flow** - OAuth uses secure PKCE flow for code exchange
4. **Route Guards** - Server-side protection for sensitive pages
5. **Secure Redirects** - Controlled redirect URLs prevent open redirects

### Why This Architecture?

- **Security**: No sensitive tokens exposed to client-side JavaScript
- **SEO**: Server-side rendering works with protected content
- **Performance**: Minimal client-side auth logic reduces bundle size
- **Reliability**: Server-side session validation prevents auth bypass
- **Standards**: Follows OAuth 2.0 and SvelteKit SSR best practices

### OAuth Configuration

Google OAuth is configured in your Supabase dashboard under **Authentication → Providers → Google**. The client ID you provided (`1070526418426-htdmkourcddj4ag404vfj4v3t2fn3nms.apps.googleusercontent.com`) should be added there along with the client secret.

**Required OAuth Settings:**
- **Authorized JavaScript origins**: Your domain (e.g., `http://localhost:5173` for dev)
- **Authorized redirect URIs**: `https://<your-supabase-ref>.supabase.co/auth/v1/callback`

## Linting

Run `npm run lint` to format and lint the project.

## Deployment

The project uses the default `adapter-auto`. Configure another adapter in `svelte.config.js` if you plan to deploy to environments like Vercel or Netlify.

## Structure

- **src/routes** – Contains SvelteKit pages and layouts. The root layout imports global styles and sets up dark‑mode watching and toast notifications
- **src/lib/server** – Server-side utilities. For example, supabase.js creates the Supabase server client and exposes a helper for getting sessions
- **src/lib/components** – App-specific components such as user avatars, login/signup forms, and menu elements
- **src/lib/ui** – Local copies of shadcn-svelte UI components so they can be customized
- **src/hooks.server.js** – Initializes Supabase for each request and protects routes with an authentication guard
- **Aliases** – Folder aliases (components, utils, ui, etc.) are declared in components.json so you can import from `$lib/...` paths
