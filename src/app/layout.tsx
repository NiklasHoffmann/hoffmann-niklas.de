import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import dynamic from "next/dynamic";
import "./globals.css";
import { ClientProviders } from "@/components/providers";
import { locales, defaultLocale } from "@/i18n/config";

// Lazy-load non-critical components to reduce initial script evaluation
const DynamicFavicon = dynamic(
  () => import("@/components/seo/DynamicFavicon").then(mod => ({ default: mod.DynamicFavicon }))
);

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Show fallback immediately, swap to real font when loaded
  preload: true,
  adjustFontFallback: true, // Reduce layout shift with font metric override
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap", // Show fallback immediately, swap to real font when loaded
  preload: true,
  adjustFontFallback: true, // Reduce layout shift with font metric override
});

export const metadata: Metadata = {
  title: {
    default: "Niklas Hoffmann | Full-Stack & Web3 Developer",
    template: "%s | Niklas Hoffmann"
  },
  description: "Full-Stack Developer mit Expertise in Web3, React, Next.js und modernen Web-Technologien. Spezialisiert auf dApp-Entwicklung und Blockchain-Integration.",
  keywords: ["Web Development", "Full-Stack Developer", "Web3", "React", "Next.js", "TypeScript", "Blockchain", "Ethereum", "dApp Development"],
  authors: [{ name: "Niklas Hoffmann", url: "https://hoffmann-niklas.de" }],
  creator: "Niklas Hoffmann",
  metadataBase: new URL("https://hoffmann-niklas.de"),
  // Note: Favicon is handled dynamically by DynamicFavicon component
  // Do NOT set icons here as it causes flashing during hydration
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: "https://hoffmann-niklas.de",
    title: "Niklas Hoffmann | Full-Stack & Web3 Developer",
    description: "Full-Stack Developer mit Expertise in Web3, React, Next.js und modernen Web-Technologien",
    siteName: "Niklas Hoffmann Portfolio",
  },
  robots: {
    index: true,
    follow: true,
  },
  // Icons werden dynamisch via DynamicFavicon Component aktualisiert
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale?: string }>;
}>) {
  const { locale = defaultLocale } = await params;

  if (locale && !locales.includes(locale as any)) {
    notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains for faster resource loading */}
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.iconify.design" crossOrigin="anonymous" />

        {/* DNS Prefetch for external resources */}
        <link rel="dns-prefetch" href="https://api.iconify.design" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />

        {/* Minimal critical inline CSS - rest in globals.css */}
        <style dangerouslySetInnerHTML={{
          __html: `
          :root{
            --background:0 0% 100%;
            --foreground:0 0% 3.6%;
            --accent:0 84.2% 60.2%;
            --border:0 0% 89.8%;
            --transition-slow:700ms;
          }
          .dark{
            --background:0 0% 3.6%;
            --foreground:0 0% 98%;
            --accent:0 84.2% 60.2%;
            --border:0 0% 14.9%;
          }
          body{
            background-color:hsl(var(--background));
            color:hsl(var(--foreground));
            margin:0;
            padding:0;
          }
        `}} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClientProviders>
          <DynamicFavicon />
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
