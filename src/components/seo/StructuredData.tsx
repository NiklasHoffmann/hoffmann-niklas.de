// Server Component - no client-side JS needed for static JSON-LD
export function StructuredData({ locale }: { locale: string }) {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Niklas Hoffmann",
        "url": "https://hoffmann-niklas.de",
        "image": "https://hoffmann-niklas.de/og-image.jpg",
        "jobTitle": "Full-Stack & Web3 Frontend Developer",
        "description": locale === 'de'
            ? "Full-Stack Developer spezialisiert auf moderne Web-Apps, Web3-Frontend-Integration und Wallet-Konnektivität"
            : locale === 'es'
                ? "Desarrollador Full-Stack especializado en aplicaciones web modernas, integración Web3 y conectividad de wallet"
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
            "addressLocality": "Neustadt an der Weinstraße",  // z.B. "München", "Berlin", etc.
            "addressRegion": "Rheinland-Pfalz",      // z.B. "Bayern", "NRW", etc.
            "postalCode": "67433",                // Deine Postleitzahl
            "addressCountry": "DE"
        },
        "telephone": "+49-151-56593771",          // Optional: Deine Telefonnummer
        "email": "mail@hoffmann-niklas.de"    // Deine E-Mail
    };

    // LocalBusiness Schema für bessere lokale Auffindbarkeit
    const localBusinessData = {
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        "name": "Niklas Hoffmann - Full-Stack & Web3 Development",
        "image": "https://hoffmann-niklas.de/og-image.jpg",
        "url": "https://hoffmann-niklas.de",
        "telephone": "+49-151-56593771",
        "email": "mail@hoffmann-niklas.de",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Fröbelstraße 20",    // Optional
            "addressLocality": "Neustadt an der Weinstraße",
            "addressRegion": "Rheinland-Pfalz",
            "postalCode": "67433",
            "addressCountry": "DE"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": "49.351222",
            "longitude": "8.134167"
        },
        "areaServed": {
            "@type": "GeoCircle",
            "geoMidpoint": {
                "@type": "GeoCoordinates",
                "latitude": "49.351222",
                "longitude": "8.134167"
            },
            "geoRadius": "50000"                  // 50km Umkreis in Metern
        },
        "priceRange": "450 EUR -1500 EUR",
        "openingHours": "Mo-Fr 09:00-18:00",
        "sameAs": [
            // Deine Social Media Profile
        ]
    };

    const websiteData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Niklas Hoffmann Portfolio",
        "url": "https://hoffmann-niklas.de",
        "description": locale === 'de'
            ? "Portfolio von Niklas Hoffmann - Full-Stack & Web3 Frontend Developer"
            : locale === 'es'
                ? "Portfolio de Niklas Hoffmann - Desarrollador Full-Stack & Web3 Frontend"
                : "Portfolio of Niklas Hoffmann - Full-Stack & Web3 Frontend Developer",
        "inLanguage": locale === 'de' ? "de-DE" : locale === 'es' ? "es-ES" : "en-US"
    };

    // Use Service instead of ProfessionalService to avoid LocalBusiness requirements
    const serviceData = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": locale === 'de'
            ? "Webentwicklung & Web3 Integration"
            : locale === 'es'
                ? "Desarrollo Web e Integración Web3"
                : "Web Development & Web3 Integration",
        "url": "https://hoffmann-niklas.de",
        "description": locale === 'de'
            ? "Professionelle Webentwicklung, Web3-Integration und Full-Stack Development Services"
            : locale === 'es'
                ? "Desarrollo web profesional, integración Web3 y servicios de desarrollo Full-Stack"
                : "Professional web development, Web3 integration and full-stack development services",
        "provider": {
            "@type": "Person",
            "name": "Niklas Hoffmann",
            "url": "https://hoffmann-niklas.de"
        },
        "areaServed": {
            "@type": "Country",
            "name": "Germany"
        },
        "serviceType": "Web Development"
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessData) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceData) }}
            />
        </>
    );
}
