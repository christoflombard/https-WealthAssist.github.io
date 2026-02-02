import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--color-background)",
                foreground: "var(--color-foreground)",
            },
            fontFamily: {
                sans: ["var(--font-inter)"],
                heading: ["var(--font-outfit)"],
            },
        },
    },
    plugins: [],
};
export default config;
