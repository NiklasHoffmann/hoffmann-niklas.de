import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ChainBackground } from "@/components/ChainBackground";
import { locales, defaultLocale } from "@/i18n/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Niklas Hoffmann | Web Developer",
  description: "Full-Stack Developer mit Passion für modernes Web Design und Performance",
  keywords: "Web Development, Next.js, React, Full-Stack Developer",
  openGraph: {
    title: "Niklas Hoffmann | Web Developer",
    description: "Full-Stack Developer mit Passion für modernes Web Design und Performance",
    url: "https://hoffmann-niklas.de",
    type: "website",
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
        <ThemeProvider>
          <div className="relative">
            <ChainBackground preset="line" customConfig={{ linkWidth: 2 }} />
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
