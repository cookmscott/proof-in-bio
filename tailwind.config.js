/** @type {import('tailwindcss').Config} */
export default {
    content: [
      './src/**/*.{html,js,svelte,ts}',
      './node_modules/shadcn-svelte/**/*.{html,js,svelte,ts}'
    ],
    theme: {
      extend: {
        fontFamily: {
          sans: ['Satoshi', 'system-ui', '-apple-system', 'sans-serif'],
        },
      },
    },
    plugins: [],
  }