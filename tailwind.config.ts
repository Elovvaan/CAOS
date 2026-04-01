import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#09090b",
        card: "#111114",
        border: "#27272a",
        accent: "#6d72ff",
      },
    },
  },
  plugins: [],
} satisfies Config;
