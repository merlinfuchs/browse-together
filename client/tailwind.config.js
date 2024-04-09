/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        discord: {
          dark: {
            0: "#202225",
            1: "#292b2f",
            2: "#2f3136",
            3: "#40444b",
          },
        },
      },
    },
  },
  plugins: [],
};
