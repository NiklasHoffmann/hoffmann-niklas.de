import dynamic from "next/dynamic";
import { getTranslations } from "next-intl/server";
import { Header, SectionScrollController } from "@/components/layout";
import { HeroSection } from "@/components/sections";

// Lazy load below-the-fold components for better FCP/LCP
const AboutSection = dynamic(() => import("@/components/sections/AboutSection").then(mod => ({ default: mod.AboutSection })), {
    loading: () => <div className="min-h-screen" />,
});
const ServicesSection = dynamic(() => import("@/components/sections/ServicesSection").then(mod => ({ default: mod.ServicesSection })), {
    loading: () => <div className="min-h-screen" />,
});
const PackagesSection = dynamic(() => import("@/components/sections/PackagesSection").then(mod => ({ default: mod.PackagesSection })), {
    loading: () => <div className="min-h-screen" />,
});
const PortfolioSection = dynamic(() => import("@/components/sections/PortfolioSection").then(mod => ({ default: mod.PortfolioSection })), {
    loading: () => <div className="min-h-screen" />,
});
const ContactSection = dynamic(() => import("@/components/sections/ContactSection").then(mod => ({ default: mod.ContactSection })), {
    loading: () => <div className="min-h-screen" />,
});
const Footer = dynamic(() => import("@/components/layout/Footer").then(mod => ({ default: mod.Footer })), {
    loading: () => <div className="h-32" />,
});

export default async function HomePage() {
    // Get translations server-side for LCP optimization
    const t = await getTranslations('hero');

    return (
        <>
            {/* Skip to content link for keyboard navigation */}
            <a
                href="#hero"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:border focus:border-border focus:rounded focus:outline-none"
            >
                Skip to content
            </a>

            <SectionScrollController />
            <Header />

            <main className="relative z-10">
                {/* SSR LCP content - immediately visible before JS loads */}
                <HeroSection ssrTitle={t('title')} ssrSubtitle={t('subtitle')} ssrPriceNote={t('priceNote')} />
                <AboutSection />
                <ServicesSection />
                <PackagesSection />
                <PortfolioSection />
                <ContactSection />
            </main>

            <Footer />
        </>
    );
}
