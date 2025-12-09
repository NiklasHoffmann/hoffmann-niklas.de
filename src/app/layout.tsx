import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import "./critical.css";
import "./globals.css";
import { ClientProviders } from "@/components/providers";
import { ConditionalChainBackground } from "@/components/background";
import { DynamicFavicon } from "@/components/seo";
import { locales, defaultLocale } from "@/i18n/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "optional", // Best performance: use fallback if font not cached
  preload: true,
  adjustFontFallback: true, // Reduce layout shift with font metric override
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "optional", // Best performance: use fallback if font not cached
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
        {/* DNS Prefetch for external resources */}
        <link rel="dns-prefetch" href="https://api.iconify.design" />
        <link rel="preconnect" href="https://api.iconify.design" crossOrigin="anonymous" />
        
        {/* Critical inline CSS for instant first paint - prevents FOUC */}
        <style dangerouslySetInnerHTML={{ __html: `
          :root{--background:0 0% 100%;--foreground:0 0% 3.6%;--accent:0 84.2% 60.2%}
          .dark{--background:0 0% 3.6%;--foreground:0 0% 98%}
          body{background-color:hsl(var(--background));color:hsl(var(--foreground));margin:0;opacity:1}
          html{scroll-behavior:smooth}
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
