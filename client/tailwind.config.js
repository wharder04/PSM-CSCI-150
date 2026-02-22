/** @type {import('tailwindcss').Config} */
//file not being used
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Monochromatic theme
        //'bg-base': '#f6f6f6',
        //'panel': '#ffffff',
        //'panel-muted': '#f0f0f0',
        //'border': '#d9d9d9',
        //'text-primary': '#1f1f1f',
        //'text-secondary': '[#5f5f5f]',
        //'text-muted': '#8a8a8a',
        //'accent-dark': '#2c2c2c',
        //'accent-mid': '#3f3f3f',
        //'accent-light': '#d4d4d4',
        'bg-base': '#ff00ff',
        'panel': '#ff00ff',
        'panel-muted': '#ff00ff',
        'border': '#ff00ff',
        'text-primary': '#ff00ff',
        'text-secondary': '#ff00ff', 
        'text-muted': '#ff00ff',
        'accent-dark': '#ff00ff',
        'accent-mid': '#ff00ff',
        'accent-light': '#ff00ff',

      },
      boxShadow: {
        'soft': '0 1px 3px rgba(0, 0, 0, 0.05)',
        'medium': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'large': '0 8px 24px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}

