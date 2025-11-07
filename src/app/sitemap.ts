import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://hoffmann-niklas.de';
    const lastModified = new Date();

    return [
        {
            url: `${baseUrl}/de`,
            lastModified,
            changeFrequency: 'weekly',
            priority: 1,
            alternates: {
                languages: {
                    en: `${baseUrl}/en`,
                    es: `${baseUrl}/es`,
                }
            }
        },
        {
            url: `${baseUrl}/en`,
            lastModified,
            changeFrequency: 'weekly',
            priority: 1,
            alternates: {
                languages: {
                    de: `${baseUrl}/de`,
                    es: `${baseUrl}/es`,
                }
            }
        },
        {
            url: `${baseUrl}/es`,
            lastModified,
            changeFrequency: 'weekly',
            priority: 1,
            alternates: {
                languages: {
                    de: `${baseUrl}/de`,
                    en: `${baseUrl}/en`,
                }
            }
        },
    ];
}
