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

