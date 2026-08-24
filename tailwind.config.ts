import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f7ff",
          500: "#1d4ed8",
          700: "#1e3a8a",
        },
      },
    },
  },
  plugins: [],
};

export default config;
