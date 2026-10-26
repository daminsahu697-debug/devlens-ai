/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          950: '#09090b', // Deep clean neutral dark (zinc-950)
          900: '#121215', // Main background / sidebar
          850: '#18181b', // Card background (zinc-900)
          800: '#202024', // Elevated card / hover state
          750: '#27272a', // Subtle border (zinc-800)
          700: '#323238', // Border highlight
          600: '#3f3f46', // Active border (zinc-700)
        },
        accent: {
          blue: '#3b82f6',
          indigo: '#6366f1',
          violet: '#8b5cf6',
          cyan: '#06b6d4',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', 'monospace']
      }
    },
  },
  plugins: [],
}
