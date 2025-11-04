'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { videos } from '@/data/videos';
import { SectionHeader } from '@/components/ui/SectionHeader';

export function YouTubeSlider() {
    const t = useTranslations('youtube');
    const [currentIndex, setCurrentIndex] = useState(0);
    const currentVideo = videos[currentIndex];

    return (
        <section
            id="videos"
            className="scroll-snap-section w-full h-screen flex items-center justify-center bg-background pt-24 pb-12 px-4"
        >
            <div className="max-w-4xl mx-auto w-full">
                <SectionHeader
                    title={t('title')}
                    subtitle={t('subtitle')}
                    className="mb-6"
                />
                <div className="relative aspect-video rounded-lg overflow-hidden bg-secondary border border-border">
                    <iframe
                        className="absolute inset-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${currentVideo.videoId}`}
                        title={currentVideo.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                    />
                </div>
                <div className="mt-4 text-center">
                    <h3 className="text-lg font-bold">{currentVideo.title}</h3>
                </div>
            </div>
        </section>
    );
}
