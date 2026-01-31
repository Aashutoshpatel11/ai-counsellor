/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // In v4, theme and plugins are often handled in CSS, 
  // but keeping this for DaisyUI config options is fine.
  plugins: [], 
  daisyui: {
    themes: ["light", "dark"],
  },
};

export default config;