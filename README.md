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

### Google OAuth Configuration

This project implements Google OAuth through a three-part setup involving Google Cloud Console, Supabase, and your application. Here's how they work together:

#### 1. Google Cloud Console Setup

**Create OAuth 2.0 Credentials:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Create OAuth 2.0 Client ID (Web application)
4. Configure the following URIs:

**Authorized JavaScript Origins:**
```
http://localhost:5173                                    # Development
https://your-supabase-ref.supabase.co                   # Supabase (required)
https://your-domain.workers.dev                         # Production deployment
```

**Authorized Redirect URIs:**
```
http://localhost:5173/auth/callback                     # Development callback
https://your-supabase-ref.supabase.co/auth/v1/callback  # Supabase OAuth callback
https://your-domain.workers.dev/auth/callback           # Production callback
```

#### 2. Supabase Configuration

**Enable Google Provider:**
1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** and toggle **Enable sign in with Google**
4. Add your Google OAuth credentials:
   - **Client ID**: From Google Console (ends with `.apps.googleusercontent.com`)
   - **Client Secret**: From Google Console (keep this secure)

#### 3. OAuth Flow in Application

**Authentication Flow:**
1. User clicks "Sign in with Google" button in `/auth`
2. Client calls `supabase.auth.signInWithOAuth({ provider: 'google' })`
3. User redirected to Google's OAuth consent screen
4. Google redirects to Supabase callback: `https://your-supabase-ref.supabase.co/auth/v1/callback`
5. Supabase processes OAuth and redirects to your app: `/auth/callback`
6. Your callback handler (`/auth/callback/+server.js`) exchanges code for session
7. User authenticated and redirected to protected area

**Key Integration Points:**
- **Supabase handles OAuth flow**: No need to implement Google's OAuth directly
- **Secure callback handling**: Server-side code exchange prevents token exposure
- **Cookie-based sessions**: Secure HTTP-only cookies for session management
- **Multiple environment support**: Same flow works for dev, staging, and production

**Important Notes:**
- The Supabase callback URL (`/auth/v1/callback`) must be exact in Google Console
- JavaScript origins must include your Supabase URL for the OAuth popup to work
- Client ID and secret are tied to your specific Google Cloud project
- Changes in Google Console can take 5-10 minutes to propagate

## Linting

Run `npm run lint` to format and lint the project.

## Deployment

The project uses the default `adapter-auto`. Configure another adapter in `svelte.config.js` if you plan to deploy to environments like Vercel or Netlify.

## Cloudflare Workers Deployment

This project is configured for deployment to Cloudflare Workers using `@sveltejs/adapter-cloudflare` and Wrangler.

### Prerequisites
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) installed (`npm install -g wrangler` or use `npx wrangler`)
- Cloudflare account and authentication (`npx wrangler login`)
- Ensure the `_headers` file is in the project root (not in `static/`)

### Steps
1. **Build the project:**
   ```sh
   npm run build
   ```
2. **Deploy to Cloudflare Workers:**
   ```sh
   npx wrangler deploy
   ```

Wrangler will use the configuration in `wrangler.toml` and output your deployed URL after a successful deployment.

## Structure

- **src/routes** – Contains SvelteKit pages and layouts. The root layout imports global styles and sets up dark‑mode watching and toast notifications
- **src/lib/server** – Server-side utilities. For example, supabase.js creates the Supabase server client and exposes a helper for getting sessions
- **src/lib/components** – App-specific components such as user avatars, login/signup forms, and menu elements
- **src/lib/ui** – Local copies of shadcn-svelte UI components so they can be customized
- **src/hooks.server.js** – Initializes Supabase for each request and protects routes with an authentication guard
- **Aliases** – Folder aliases (components, utils, ui, etc.) are declared in components.json so you can import from `$lib/...` paths
