import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import { ServicesSection } from "@/components/ServicesSection";
import { PortfolioSection } from "@/components/PortfolioSection";
import { YouTubeSlider } from "@/components/YouTubeSlider";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";

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
