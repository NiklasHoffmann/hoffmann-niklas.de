import dynamic from "next/dynamic";
import { Header, SmoothScrollEnhancer } from "@/components/layout";
import { HeroSection } from "@/components/sections";
import { ClientProvider } from "./client-provider";
import { ResizeHandler } from "@/components/layout/ResizeHandler";
import { BrowserUIController } from "@/components/layout/BrowserUIController";
import { ScrollSnapProtector } from "@/components/layout/ScrollSnapProtector";

// Lazy load chain background - it's decorative and can load after critical content
const ClientChainBackground = dynamic(() => import("@/components/background/ClientChainBackground").then(mod => ({ default: mod.ClientChainBackground })), {
    loading: () => null,
});

// Feature flags - set to true to show sections
const SHOW_PORTFOLIO = false; // TODO: Set to true when portfolio projects are ready

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

export default async function HomePage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    return (
        <ClientProvider locale={locale}>
            <ResizeHandler />
            <SmoothScrollEnhancer />
            <ScrollSnapProtector />
            {/* Skip to content link for keyboard navigation */}
            <a
                href="#hero"
                className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:top-4 focus-visible:left-4 focus-visible:z-[100] focus-visible:px-4 focus-visible:py-2 focus-visible:bg-background focus-visible:text-foreground focus-visible:border focus-visible:border-border focus-visible:rounded focus-visible:outline-none"
            >
                Skip to content
            </a>

            <Header />

            {/* Browser UI Controller - hides browser chrome on mobile when not in hero */}
            <BrowserUIController />

            {/* MAIN is the scroll container with scroll-snap */}
            <main
                id="main-scroll-container"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    overflowY: 'scroll',
                    overflowX: 'hidden',
                    scrollSnapType: 'y mandatory',
                    scrollPaddingTop: '0px',
                    WebkitOverflowScrolling: 'touch',
                }}
            >
                {/* Content sections wrapper - defines the scrollable height */}
                <div style={{ position: 'relative', minHeight: '100%' }}>
                    {/* Chain Background - matches content height */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        minHeight: '100vh',
                        pointerEvents: 'none',
                        zIndex: 1
                    }}>
                        <ClientChainBackground />
                    </div>

                    {/* Content sections - relative positioning, above chain */}
                    <div style={{ position: 'relative', zIndex: 10 }}>
                        <HeroSection />
                        <AboutSection />
                        <ServicesSection />
                        <PackagesSection />
                        {SHOW_PORTFOLIO && <PortfolioSection />}
                        <ContactSection />
                        <Footer />
                    </div>
                </div>
            </main>
        </ClientProvider>
    );
}
