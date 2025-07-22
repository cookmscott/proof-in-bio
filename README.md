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
