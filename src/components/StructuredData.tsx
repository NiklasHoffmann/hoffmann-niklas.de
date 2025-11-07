'use client';

export function StructuredData({ locale }: { locale: string }) {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Niklas Hoffmann",
        "url": "https://hoffmann-niklas.de",
        "image": "https://hoffmann-niklas.de/api/og",
        "jobTitle": locale === 'de' ? "Full-Stack & Web3 Frontend Developer" : "Full-Stack & Web3 Frontend Developer",
        "description": locale === 'de'
            ? "Full-Stack Developer spezialisiert auf moderne Web-Apps, Web3-Frontend-Integration und Wallet-Konnektivität"
            : "Full-Stack Developer specialized in modern web apps, Web3 frontend integration and wallet connectivity",
        "knowsAbout": [
            "Web Development",
            "Full-Stack Development",
            "Web3",
            "Blockchain",
            "React",
            "Next.js",
            "TypeScript",
            "Ethereum",
            "Smart Contracts",
            "dApp Development",
            "Frontend Development",
            "Backend Development"
        ],
        "sameAs": [
            // Füge hier deine Social Media Profile hinzu
            // "https://github.com/dein-username",
            // "https://linkedin.com/in/dein-profil",
            // "https://twitter.com/dein-handle"
        ],
        "address": {
            "@type": "PostalAddress",
            "addressCountry": "DE"
        }
    };

    const websiteData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Niklas Hoffmann Portfolio",
        "url": "https://hoffmann-niklas.de",
        "description": locale === 'de'
            ? "Portfolio von Niklas Hoffmann - Full-Stack & Web3 Frontend Developer"
            : "Portfolio of Niklas Hoffmann - Full-Stack & Web3 Frontend Developer",
        "inLanguage": locale === 'de' ? "de-DE" : locale === 'es' ? "es-ES" : "en-US",
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://hoffmann-niklas.de/{locale}?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
        }
    };

    const professionalService = {
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        "name": "Niklas Hoffmann - Web Development Services",
        "url": "https://hoffmann-niklas.de",
        "description": locale === 'de'
            ? "Professionelle Webentwicklung, Web3-Integration und Full-Stack Development Services"
            : "Professional web development, Web3 integration and full-stack development services",
        "provider": {
            "@type": "Person",
            "name": "Niklas Hoffmann"
        },
        "areaServed": "DE",
        "serviceType": [
            "Web Development",
            "Web3 Integration",
            "Full-Stack Development",
            "Frontend Development",
            "Backend Development",
            "UI/UX Design"
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(professionalService) }}
            />
        </>
    );
}
