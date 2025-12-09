import dynamic from "next/dynamic";
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
    return (
        <>
            {/* Skip to content link for keyboard navigation */}
            <a
                href="#hero"
                className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:top-4 focus-visible:left-4 focus-visible:z-[100] focus-visible:px-4 focus-visible:py-2 focus-visible:bg-background focus-visible:text-foreground focus-visible:border focus-visible:border-border focus-visible:rounded focus-visible:outline-none"
            >
                Skip to content
            </a>

            <SectionScrollController />
            <Header />

            <main className="relative z-10">
                <HeroSection />
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
