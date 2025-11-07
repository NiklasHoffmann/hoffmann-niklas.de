import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import "./globals.css";
import { ClientProviders } from "@/components/ClientProviders";
import { ConditionalChainBackground } from "@/components/ConditionalChainBackground";
import { locales, defaultLocale } from "@/i18n/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Optimize font loading
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap", // Optimize font loading
  preload: true,
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
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClientProviders>
          <div className="relative min-h-screen">
            {/* Chain Background Layer - z-1 (zwischen Background und Content) */}
            <div className="absolute inset-0 pointer-events-none z-[1]">
              <ConditionalChainBackground />
            </div>

            {/* Content Layer - z-10 */}
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
