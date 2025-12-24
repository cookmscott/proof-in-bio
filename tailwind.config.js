/** @type {import('tailwindcss').Config} */
export default {
    content: [
      './src/**/*.{html,js,svelte,ts}',
      './node_modules/shadcn-svelte/**/*.{html,js,svelte,ts}'
    ],
    theme: {
      extend: {
        fontFamily: {
          sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
          alpino: ['Alpino', 'sans-serif'],
          karma: ['Karma', 'serif'],
        },
      },
    },
    plugins: [],
  }