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
      },
      colors: {
        customDark: '#131213',
        headerDark:'#18191d',
        editionColor:'#787979'
      },
    },
  },
  
  
  darkMode: "class",
  plugins: [nextui()],
}

