import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0047AB",
        background: {
          dark: "#0d1117",
        },
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        light: { colors: { primary: "#00A6CB" } },
        dark: { colors: { primary: "#00A6CB" } }, // mismo color para ambos
      },
    }),
  ],
};