'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { videos } from '@/data/videos';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useOrientationResize } from '@/hooks/useOrientationResize';

export function YouTubeSlider() {
    const t = useTranslations('youtube');
    const [currentIndex, setCurrentIndex] = useState(0);
    const currentVideo = videos[currentIndex];
    const { key } = useOrientationResize();

    return (
        <section
            id="videos"
            key={key}
            className="scroll-snap-section w-full h-screen max-h-screen flex items-center justify-center bg-background overflow-hidden px-6 sm:px-12 lg:px-16 xl:px-20"
        >
            <div className="max-w-2xl mx-auto w-full h-full max-h-screen flex flex-col justify-center py-20 md:py-24">
                <SectionHeader
                    title={t('title')}
                    subtitle={t('subtitle')}
                    className="mb-4 sm:mb-6 flex-shrink-0"
                />
                <div className="relative w-full max-w-full flex-shrink" style={{ aspectRatio: '16/9', maxHeight: 'calc(100vh - 280px)' }}>
                    <div 
                        className="absolute inset-0 rounded-lg overflow-hidden bg-secondary border border-border"
                        style={{ transition: 'border-color 700ms ease-in-out, background-color 700ms ease-in-out' }}
                    >
                        <iframe
                            className="absolute inset-0 w-full h-full"
                            src={`https://www.youtube.com/embed/${currentVideo.videoId}`}
                            title={currentVideo.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                        />
                    </div>
                </div>
                <div className="mt-4 text-center flex-shrink-0">
                    <h3 className="text-base sm:text-lg font-bold">{currentVideo.title}</h3>
                </div>
            </div>
        </section>
    );
}
