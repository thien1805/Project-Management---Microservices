import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        lamaSky: "#C3EBFA",
        lamaSkyLight: "#EDF9FD",
        lamaPurple: "#CFCEFF",
        lamaPurpleLight: "#F1F0FF",
        lamaYellow: "#FAE27C",
        lamaYellowLight: "#FEFCe8",
        facebook: {
          50: "#f0f5ff",
          200: "#90b8ff",
          600: "#1877f2",
        },
        linkedin: {
          50: "#eff8ff",
          200: "#80b3e8",
          600: "#0a66c2",
        },
      },
      fontFamily:{
        'michroma': ["Michroma", 'sans-serif'],
        'orbitron': ["Orbitron", 'sans-serif'],
      }
    },
  },
  plugins: [],
};
export default config;
