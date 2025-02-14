import "./globals.css";

import type { Metadata } from "next";
import { Shrikhand } from "next/font/google";
import localFont from "next/font/local";
import Providers from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const shrikhand = Shrikhand({
    weight: "400",
    style: "normal",
    subsets: ["latin"],
    display: "swap",
    variable: "--font-shrikhand",
});

const bricolage = localFont({
    src: "./fonts/Bricolage.ttf",
    variable: "--font-bricolage",
});

const ibm = localFont({
    src: [
        {
            path: "./fonts/IBMPlexMono-ExtraLight.ttf",
            weight: "200",
            style: "normal",
        },
        {
            path: "./fonts/IBMPlexMono-ExtraLightItalic.ttf",
            weight: "200",
            style: "italic",
        },
        {
            path: "./fonts/IBMPlexMono-Light.ttf",
            weight: "300",
            style: "normal",
        },
        {
            path: "./fonts/IBMPlexMono-LightItalic.ttf",
            weight: "300",
            style: "italic",
        },
        {
            path: "./fonts/IBMPlexMono-Regular.ttf",
            weight: "400",
            style: "normal",
        },
        {
            path: "./fonts/IBMPlexMono-Italic.ttf",
            weight: "400",
            style: "italic",
        },
        {
            path: "./fonts/IBMPlexMono-Bold.ttf",
            weight: "700",
            style: "normal",
        },
        {
            path: "./fonts/IBMPlexMono-BoldItalic.ttf",
            weight: "700",
            style: "italic",
        },
    ],
    variable: "--font-ibm",
});

export const metadata: Metadata = {
    title: {
        template: "%s · Crème'ai",
        default: "Crème'ai",
    },
    description: "Crème'ai is a platform for DeFi AI Agents",
    appleWebApp: {
        title: "Crème'ai",
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body
                className={`${ibm.variable} ${bricolage.variable} ${shrikhand.variable} antialiased`}
            >
                <Providers>{children}</Providers>
                <Toaster />
                <Analytics />
                <SpeedInsights />
            </body>
        </html>
    );
}
