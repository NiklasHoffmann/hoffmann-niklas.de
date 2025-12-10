import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import dynamic from "next/dynamic";
import "./globals.css";
import { ClientProviders } from "@/components/providers";
import { ConditionalChainBackground } from "@/components/background";
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

        {/* Expanded critical inline CSS for instant first paint - prevents FOUC and render blocking */}
        <style dangerouslySetInnerHTML={{
          __html: `
          :root{
            --background:0 0% 100%;
            --foreground:0 0% 3.6%;
            --card:0 0% 100%;
            --card-foreground:0 0% 3.6%;
            --secondary:0 0% 96.1%;
            --secondary-foreground:0 0% 9%;
            --accent:0 84.2% 60.2%;
            --accent-foreground:0 0% 100%;
            --border:0 0% 89.8%;
            --muted-foreground:0 0% 45.1%;
            --transition-slow:700ms;
            --scrollbar-track:#ffffff;
            --scrollbar-thumb:#090909;
          }
          .dark{
            --background:0 0% 3.6%;
            --foreground:0 0% 98%;
            --card:0 0% 3.6%;
            --card-foreground:0 0% 98%;
            --secondary:0 0% 14.9%;
            --secondary-foreground:0 0% 98%;
            --accent:0 84.2% 60.2%;
            --accent-foreground:0 0% 3.6%;
            --border:0 0% 14.9%;
            --muted-foreground:0 0% 63.9%;
            --scrollbar-track:#090909;
            --scrollbar-thumb:#fafafa;
          }
          *{border-color:hsl(var(--border))}
          html{
            scroll-behavior:smooth !important;
            scroll-snap-type:y mandatory !important;
            margin:0;
            padding:0;
            width:100%;
            max-width:100vw;
            overflow-x:hidden;
          }
          body{
            background-color:hsl(var(--background));
            color:hsl(var(--foreground));
            margin:0;
            padding:0;
            max-width:100vw;
            overflow-x:hidden;
            transition:background-color var(--transition-slow) ease-in-out,color var(--transition-slow) ease-in-out;
          }
          .scroll-snap-section{
            scroll-snap-align:start !important;
            scroll-snap-stop:normal !important;
            min-height:100vh;
            min-height:100dvh;
          }
          @media(max-width:1023px){
            .scroll-snap-section{
              height:100vh;
              height:100dvh;
              width:100vw;
            }
          }
        `}} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClientProviders>
          <DynamicFavicon />
          {/* Content Wrapper - contains both chain and content */}
          <div className="relative">
            {/* Chain Background Layer - absolute, covers full document height */}
            <div className="absolute inset-0 pointer-events-none z-[1]">
              <ConditionalChainBackground />
            </div>
            {/* Content Layer */}
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
