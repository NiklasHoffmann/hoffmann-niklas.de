import dynamic from "next/dynamic";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";

// Lazy load below-the-fold components for better FCP/LCP
const AboutSection = dynamic(() => import("@/components/AboutSection").then(mod => ({ default: mod.AboutSection })), {
    loading: () => <div className="min-h-screen" />,
    ssr: true,
});
const ServicesSection = dynamic(() => import("@/components/ServicesSection").then(mod => ({ default: mod.ServicesSection })), {
    loading: () => <div className="min-h-screen" />,
    ssr: true,
});
const PortfolioSection = dynamic(() => import("@/components/PortfolioSection").then(mod => ({ default: mod.PortfolioSection })), {
    loading: () => <div className="min-h-screen" />,
    ssr: true,
});
const YouTubeSlider = dynamic(() => import("@/components/YouTubeSlider").then(mod => ({ default: mod.YouTubeSlider })), {
    loading: () => <div className="min-h-[50vh]" />,
    ssr: true,
});
const ContactSection = dynamic(() => import("@/components/ContactSection").then(mod => ({ default: mod.ContactSection })), {
    loading: () => <div className="min-h-screen" />,
    ssr: true,
});
const Footer = dynamic(() => import("@/components/Footer").then(mod => ({ default: mod.Footer })), {
    loading: () => <div className="h-32" />,
    ssr: true,
});

export default function HomePage() {
    return (
        <>
            <Header />

            <main className="relative z-10">
                <HeroSection />
                <AboutSection />
                <ServicesSection />
                <PortfolioSection />
                <YouTubeSlider />
                <ContactSection />
            </main>

            <Footer />
        </>
    );
}
