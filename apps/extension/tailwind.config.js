/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './entrypoints/**/*.{html,ts,tsx}',
    '../../packages/core/src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {}
  },
  plugins: []
}
