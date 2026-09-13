import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0a070e',
        surface: '#1a1622',
        'surface-light': '#221d2e',
        border: '#2d2a35',
        accent: '#8b5cf6',
        'accent-hover': '#7c3aed',
        'text-secondary': '#a1a1aa',
      },
    },
  },
  plugins: [],
};

export default config;
