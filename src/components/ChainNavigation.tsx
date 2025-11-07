'use client';

import { useEffect, useRef, useState } from 'react';

interface ChainNavigationProps {
    sections: { id: string; label: string }[];
}

export function ChainNavigation({ sections }: ChainNavigationProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [windowHeight, setWindowHeight] = useState(800);
    const animationFrameRef = useRef<number | null>(null);
    // OPTIMIZATION: Cache scrollHeight to avoid layout thrashing
    const scrollHeightCache = useRef(0);

    // Scroll tracking
    useEffect(() => {
        const handleScroll = () => {
            if (typeof window === 'undefined') return;
            // Use cached scrollHeight instead of recalculating
            const progress = scrollHeightCache.current > 0 ? window.scrollY / scrollHeightCache.current : 0;
            setScrollProgress(Math.min(progress, 1));
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const updateDimensions = () => {
            setWindowHeight(window.innerHeight);
            // OPTIMIZATION: Update scrollHeight cache on resize
            scrollHeightCache.current = document.documentElement.scrollHeight - window.innerHeight;
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Draw chain line with bezier curves
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const draw = () => {
            const width = canvas.width;
            const height = canvas.height;

            // Clear canvas
            ctx.clearRect(0, 0, width, height);

            // Zeichne eine durchgehende Kette mit Bezier-Kurven
            // Die Kette wechselt die Seiten in sanften Kurven

            const sections = 6;
            const sectionHeight = height / sections;

            // Starte links, wechsle die Seiten
            const points: { x: number; y: number }[] = [];

            for (let i = 0; i <= sections; i++) {
                const y = i * sectionHeight;
                // Wechsle zwischen links (x=25) und rechts (x=103)
                const x = i % 2 === 0 ? 25 : 103;
                points.push({ x, y });
            }

            // Zeichne die komplette Kette als smooth curve
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // Zeichne mit quadratischen Bezier-Kurven
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);

            for (let i = 1; i < points.length - 1; i++) {
                const xc = (points[i].x + points[i + 1].x) / 2;
                const yc = (points[i].y + points[i + 1].y) / 2;
                ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
            }

            ctx.stroke();

            // Zeichne die besuchten Teile mit Gradient/heller Farbe
            const visitedLength = scrollProgress * height;

            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // Berechne welche Punkt besucht sind
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);

            let currentLength = 0;
            for (let i = 1; i < points.length && currentLength < visitedLength; i++) {
                const xc = (points[i].x + points[i + 1].x) / 2;
                const yc = (points[i].y + points[i + 1].y) / 2;

                const prevPoint = { x: points[i - 1].x, y: points[i - 1].y };
                const segmentLength = Math.sqrt(
                    Math.pow(xc - prevPoint.x, 2) + Math.pow(yc - prevPoint.y, 2)
                );

                if (currentLength + segmentLength <= visitedLength) {
                    ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
                    currentLength += segmentLength;
                } else {
                    // Zeichne teilweise
                    const ratio = (visitedLength - currentLength) / segmentLength;
                    const endX = prevPoint.x + (xc - prevPoint.x) * ratio;
                    const endY = prevPoint.y + (yc - prevPoint.y) * ratio;
                    ctx.quadraticCurveTo(points[i].x, points[i].y, endX, endY);
                    break;
                }
            }

            ctx.stroke();

            animationFrameRef.current = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [scrollProgress, windowHeight]);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            // OPTIMIZATION: Use requestAnimationFrame to batch layout reads
            requestAnimationFrame(() => {
                canvas.width = canvas.offsetWidth;
                canvas.height = canvas.offsetHeight;
            });
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="fixed left-0 top-0 h-screen w-32 pointer-events-none z-40 bg-red-500/20 overflow-hidden">
            <canvas
                ref={canvasRef}
                width={128}
                height={800}
                className="w-full h-full bg-blue-500/20 block"
                suppressHydrationWarning
            />
        </div>
    );
}
