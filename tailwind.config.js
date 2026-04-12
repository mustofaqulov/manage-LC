/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './**/*.{js,ts,jsx,tsx}',
    '!./node_modules/**',
  ],
  theme: {
    extend: {
      colors: {
        light: {
          bg: '#ffffff',
          'bg-secondary': '#f9fafb',
          'bg-tertiary': '#f3f4f6',
          text: '#1f2937',
          'text-secondary': '#6b7280',
          'text-tertiary': '#9ca3af',
          border: '#e5e7eb',
          'border-light': '#f0f0f0',
        },
        dark: {
          bg: '#050505',
          'bg-secondary': '#0a0a0a',
          'bg-tertiary': '#141414',
          text: '#e5e5e5',
          'text-secondary': '#9ca3af',
          'text-tertiary': '#6b7280',
          border: '#27272a',
          'border-light': '#3f3f46',
        },
      },
    },
  },
  plugins: [],
};
