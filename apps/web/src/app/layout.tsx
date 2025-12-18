import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Maya - Social Media Manager",
    description: "Sistema de gestão de social media com planejamento, produção e analytics",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "Maya",
    },
    formatDetection: {
        telephone: false,
    },
};

export const viewport: Viewport = {
    themeColor: "#8B5CF6",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt-BR" suppressHydrationWarning>
            <head>
                <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
            </head>
            <body className={inter.className}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
