/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Core backgrounds
        'cp-bg': '#1E1E2E',
        'cp-card': '#27293D',
        'cp-card-hover': '#2F3152',

        // Accents
        'cp-primary': '#E14ECA',
        'cp-secondary': '#5548C8',

        // Semantic
        'cp-success': '#00F2C3',
        'cp-danger': '#FD5D93',
        'cp-warning': '#FF9F43',

        // Text
        'cp-text': '#FFFFFF',
        'cp-muted': '#9A9A9A',

        // Borders / Surfaces
        'cp-border': '#3A3A5C',
        'cp-surface': '#2A2A40',
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-primary':
          '0 4px 20px 0 rgba(0, 0, 0, 0.14), 0 7px 10px -5px rgba(225, 78, 202, 0.4)',
        'glow-success':
          '0 4px 20px 0 rgba(0, 0, 0, 0.14), 0 7px 10px -5px rgba(0, 242, 195, 0.4)',
        'glow-danger':
          '0 4px 20px 0 rgba(0, 0, 0, 0.14), 0 7px 10px -5px rgba(253, 93, 147, 0.4)',
        card: '0 1px 20px 0 rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        xl: '16px',
      },
    },
  },
  plugins: [],
};
