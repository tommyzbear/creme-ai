import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
    darkMode: ["class"],
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                ai: {
                    DEFAULT: "hsl(var(--ai))",
                    foreground: "hsl(var(--ai-foreground))",
                    70: "hsl(var(--ai) / 0.7)",
                },
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                chart: {
                    "1": "hsl(var(--chart-1))",
                    "2": "hsl(var(--chart-2))",
                    "3": "hsl(var(--chart-3))",
                    "4": "hsl(var(--chart-4))",
                    "5": "hsl(var(--chart-5))",
                },
                sidebar: {
                    DEFAULT: "hsl(var(--sidebar-background))",
                    foreground: "hsl(var(--sidebar-foreground))",
                    primary: "hsl(var(--sidebar-primary))",
                    "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
                    accent: "hsl(var(--sidebar-accent))",
                    "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
                    border: "hsl(var(--sidebar-border))",
                    ring: "hsl(var(--sidebar-ring))",
                },
            },
            fontSize: {
                xs: ".52rem",
                sm: ".75rem",
                tiny: ".75rem",
                base: ".875rem",
                lg: "1rem",
                xl: "1.125rem",
                "2xl": "1.25rem",
                "3xl": "1.5rem",
                "4xl": "1.875rem",
                "5xl": "2.25rem",
                "6xl": "3rem",
                "7xl": "4rem",
                "8xl": "5rem",
                "9xl": "6rem",
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
                "4xl": "calc(var(--radius) * 4)",
                "5xl": "calc(var(--radius) * 5)",
                "6xl": "calc(var(--radius) * 6)",
            },
            backgroundImage: {
                radial: "radial-gradient(var(--tw-gradient-stops))",
            },
            keyframes: {
                float: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-10px)" },
                },
                roam: {
                    "0%": { transform: "translate(60%, 10%)" },
                    "20%": { transform: "translate(20%, 50%)" },
                    "40%": { transform: "translate(50%, 0%)" },
                    "60%": { transform: "translate(70%, 30%)" },
                    "80%": { transform: "translate(30%, 40%)" },
                    "100%": { transform: "translate(60%, 10%)" },
                },
            },
            animation: {
                float: "float 3s ease-in-out infinite",
                roam: "roam 25s ease-in-out infinite",
                "roam-fast": "roam 20s ease-in-out infinite reverse",
            },
            fontFamily: {
                ibm: ["var(--font-ibm)"],
                bricolage: ["var(--font-bricolage)"],
            },
            boxShadow: {
                "b-sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
                "b-md": "0 2px 4px -1px rgb(0 0 0 / 0.1)",
                "b-lg": "0 4px 6px -2px rgb(0 0 0 / 0.1)",
            },
            screens: {
                "3xl": "1920px", // 120rem
                "4xl": "2560px", // 160rem
            },
        },
    },
    plugins: [animate],
};

export default config;
