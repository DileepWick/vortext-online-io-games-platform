const { nextui } = require("@nextui-org/react");
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
     "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        primaryRegular:['Rubik'],
        scary:['scary'],
        scary2:['scary2'],
      },
      colors: {
        customDark: '#030616',
        headerDark:'#030616',
        editionColor:'#787979',
        customPink: '#8668cf',
        customGreen: '#00FF00',
        inputColor:"#202125"
      },
      animation: {
        blink: 'blink 0.5s linear infinite',
      },
      keyframes: {
        blink: {
          '0%': { backgroundColor: 'white' },
          '50%': { backgroundColor: 'red' },
          '100%': { backgroundColor: 'white' },
        },
      },
      theme: {
        extend: {
          textColor: {
            DEFAULT: '#000', // Black text by default
            dark: '#fff',    // White text in dark mode
          },
        },
      },
    },
  },
  
  
  darkMode: "class",
  plugins: [nextui()],
}

