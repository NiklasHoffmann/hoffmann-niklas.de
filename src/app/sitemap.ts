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
        },
        {
            url: `${baseUrl}/en`,
            lastModified,
            changeFrequency: 'weekly',
            priority: 1,
        },
    ];
}
