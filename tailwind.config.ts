import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#102a43",
          light: "#183b5b",
          dark: "#091d2d",
        },
        navy2: "#183b5b",
        blue: {
          DEFAULT: "#246b9b",
          accent: "#1f567c",
        },
        gold: {
          DEFAULT: "#d99a2b",
          hover: "#b87f1c",
          light: "#f5d28d",
          accent: "#f2c35e",
          soft: "#f5ead5",
          dark: "#9a6714",
        },
        cream: {
          DEFAULT: "#fbf7ef",
          card: "#fffaf2",
          dark: "#f7f3eb",
        },
        paper: "#fffdf9",
        ink: {
          DEFAULT: "#172b3a",
          secondary: "#3d5362",
          dark: "#04111b",
        },
        muted: "#6c7b87",
        line: "#e9e1d4",
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["Arial", "Helvetica", "sans-serif"],
      },
      boxShadow: {
        dhaba: "0 18px 45px rgba(16, 42, 67, 0.10)",
        card: "0 5px 18px rgba(16, 42, 67, 0.035)",
        gold: "0 10px 22px rgba(217, 154, 43, 0.24)",
        brand: "0 7px 18px rgba(16, 42, 67, 0.16)",
      },
    },
  },
  plugins: [],
};

export default config;
