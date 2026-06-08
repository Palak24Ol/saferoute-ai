/** @type {import('tailwindcss').Config} */
import withMT from "@material-tailwind/react/utils/withMT";

export default withMT({
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: '#E91E8C',
          'pink-light': '#FFF0F5',
          'pink-muted': '#F8D7E8',
          purple: '#2D1470',
          maroon: '#8B1A4A',
          sos: '#FF4757',
          success: '#2ED573',
        },
        neutral: {
          body: '#6B5B7B',
        },
        // keep existing tokens
        golden: '#F6F3CC',
        themeBlue: '#091F5B',
        background: '#EEEFF3',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        'xl': '12px',
      },
      boxShadow: {
        card: '0 4px 20px rgba(233,30,140,0.08)',
        'card-hover': '0 8px 32px rgba(233,30,140,0.16)',
      },
      keyframes: {
        ping: {
          '75%, 100%': { transform: 'scale(2)', opacity: '0' },
        },
        sosPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255,71,87,0.7)' },
          '70%': { boxShadow: '0 0 0 16px rgba(255,71,87,0)' },
        },
      },
      animation: {
        'sos-pulse': 'sosPulse 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    darkTheme: "light",
  },
});
