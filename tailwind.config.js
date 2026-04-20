/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      maxWidth: {
        /** Área útil en monitores HD/Full HD con sidebar */
        content: 'min(100%, 112rem)',
      },
      screens: {
        /** Entre móvil y tablet: listas y tablas */
        xs: '480px',
      },
    },
  },
  plugins: [],
}
