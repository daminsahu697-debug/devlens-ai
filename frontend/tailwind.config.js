function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}), ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
}

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
          950: 'var(--surface-950)', // Page background: #f8fafc (light) / #09090b (dark)
          900: 'var(--surface-900)', // Card background: #ffffff (light) / #121215 (dark)
          850: 'var(--surface-850)', // Card elevated: #ffffff (light) / #18181b (dark)
          800: 'var(--surface-800)', // Inner panel/pill: #f1f5f9 (light) / #202024 (dark)
          750: 'var(--surface-750)', // Subtle border: #e2e8f0 (light) / #27272a (dark)
          700: 'var(--surface-700)', // Border highlight: #cbd5e1 (light) / #323238 (dark)
          600: 'var(--surface-600)', // Active border: #94a3b8 (light) / #3f3f46 (dark)
        },
        sky: {
          50: withOpacity('--palette-50'),
          100: withOpacity('--palette-100'),
          200: withOpacity('--palette-200'),
          300: withOpacity('--palette-300'),
          400: withOpacity('--palette-400'),
          500: withOpacity('--palette-500'),
          600: withOpacity('--palette-600'),
          700: withOpacity('--palette-700'),
          800: withOpacity('--palette-800'),
          900: withOpacity('--palette-900'),
          950: withOpacity('--palette-950'),
        },
        accent: {
          blue: '#0284c7',
          sky: '#0284c7',
          indigo: '#4f46e5',
          violet: '#7c3aed',
          emerald: '#059669',
          amber: '#d97706',
          rose: '#e11d48'
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
