import { useState, useEffect, useRef } from 'react';

interface Rotation {
    x: number;
    y: number;
}

interface CubeDragOptions {
    autoRotate?: boolean;
    autoRotateSpeed?: number;
    initialRotation?: Rotation;
}

// Global cache to persist rotation across component mounts
let cachedRotation: Rotation | null = null;
let hasLoadedFromStorage = false;
let lastUpdateTime = Date.now();

function getInitialRotation(initialRotation: Rotation): Rotation {
    // Return cached rotation if available
    if (cachedRotation) {
        // Add a forward offset based on time elapsed since last update
        // to compensate for the brief pause during re-mount
        const now = Date.now();
        const elapsed = now - lastUpdateTime;

        // At 60fps, each frame is ~16.67ms
        // autoRotateSpeed is 0.3 degrees per frame
        // So: degrees per millisecond = 0.3 / 16.67 ≈ 0.018
        const compensationY = elapsed * 0.018;

        lastUpdateTime = now;

        return {
            x: cachedRotation.x,
            y: cachedRotation.y + compensationY
        };
    }

    // Load from localStorage only once
    if (!hasLoadedFromStorage && typeof window !== 'undefined') {
        hasLoadedFromStorage = true;
        const saved = localStorage.getItem('cube-rotation');

        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                cachedRotation = parsed;
                lastUpdateTime = Date.now();
                return { ...parsed }; // Return a copy
            } catch {
                // Failed to parse, continue to use initial
            }
        }
    }

    // Use initial rotation and cache it
    cachedRotation = { ...initialRotation };
    lastUpdateTime = Date.now();
    return { ...initialRotation };
}

export function useCubeDrag(options: CubeDragOptions = {}) {
    const {
        autoRotate = true,
        autoRotateSpeed = 0.3,
        initialRotation = { x: -10, y: 15 },
    } = options;

    // Initialize rotation from global cache or localStorage
    const [rotation, setRotation] = useState<Rotation>(() => getInitialRotation(initialRotation));

    const containerRef = useRef<HTMLDivElement>(null); // Static container
    const cubeRef = useRef<HTMLDivElement>(null); // Rotating cube

    const isDraggingRef = useRef(false);
    const lastPosRef = useRef({ x: 0, y: 0 });
    const isUsingMotionRef = useRef(false); // Track if motion is being used
    const motionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const baseRotationRef = useRef<Rotation>(rotation); // Store base rotation when motion starts

    // Update global cache immediately on every rotation change
    useEffect(() => {
        cachedRotation = { ...rotation }; // Update global cache immediately
        lastUpdateTime = Date.now(); // Track when we last updated
    }, [rotation]);

    // Save rotation to localStorage (debounced)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            localStorage.setItem('cube-rotation', JSON.stringify(rotation));
        }, 100); // Debounce to avoid too many writes

        return () => clearTimeout(timeoutId);
    }, [rotation]);

    // Auto-rotation
    useEffect(() => {
        if (!autoRotate) return;

        let rafId: number;
        const animate = () => {
            if (!isDraggingRef.current && !isUsingMotionRef.current) {
                setRotation((prev: Rotation) => ({
                    x: prev.x,
                    y: prev.y + autoRotateSpeed
                }));
            }
            rafId = requestAnimationFrame(animate);
        };

        rafId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafId);
    }, [autoRotate, autoRotateSpeed]);

    // Drag functionality - attach to CONTAINER not cube!
    useEffect(() => {
        const container = containerRef.current;
        const cube = cubeRef.current;
        if (!container) return;

        const handleMouseDown = (e: MouseEvent) => {
            isDraggingRef.current = true;
            lastPosRef.current = { x: e.clientX, y: e.clientY };
            if (cube) cube.style.cursor = 'grabbing';
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDraggingRef.current) return;

            const deltaX = e.clientX - lastPosRef.current.x;
            const deltaY = e.clientY - lastPosRef.current.y;

            setRotation((prev: Rotation) => ({
                x: prev.x - deltaY * 0.5,
                y: prev.y + deltaX * 0.5,
            }));

            lastPosRef.current = { x: e.clientX, y: e.clientY };
        };

        const handleMouseUp = () => {
            if (!isDraggingRef.current) return;
            isDraggingRef.current = false;
            if (cube) cube.style.cursor = 'grab';
        };

        const handleTouchStart = (e: TouchEvent) => {
            if (!e.touches[0]) return;
            isDraggingRef.current = true;
            lastPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!isDraggingRef.current || !e.touches[0]) return;

            // Prevent scrolling while rotating cube
            e.preventDefault();

            const deltaX = e.touches[0].clientX - lastPosRef.current.x;
            const deltaY = e.touches[0].clientY - lastPosRef.current.y;

            setRotation((prev: Rotation) => ({
                x: prev.x - deltaY * 0.5,
                y: prev.y + deltaX * 0.5,
            }));

            lastPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        };

        const handleTouchEnd = () => {
            isDraggingRef.current = false;
        };

        // Attach mousedown to CONTAINER (doesn't rotate!)
        container.addEventListener('mousedown', handleMouseDown);
        container.addEventListener('touchstart', handleTouchStart, { passive: true });

        // Move and up still on window
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchmove', handleTouchMove, { passive: false }); // passive: false to allow preventDefault
        window.addEventListener('touchend', handleTouchEnd);

        return () => {
            container.removeEventListener('mousedown', handleMouseDown);
            container.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, []);

    // DeviceMotion (Beschleunigungssensor) - Würfel durch Handy-Neigung steuern
    // NUR auf Mobile/Touch-Geräten aktivieren
    useEffect(() => {
        // Check if device is mobile/tablet with touch support
        const isMobileDevice = typeof window !== 'undefined' && (
            'ontouchstart' in window ||
            navigator.maxTouchPoints > 0
        );

        if (!isMobileDevice || typeof window === 'undefined' || !window.DeviceMotionEvent) return;

        let calibrationX = 0;
        let calibrationY = 0;
        let isCalibrated = false;

        const handleDeviceMotion = (e: DeviceMotionEvent) => {
            if (isDraggingRef.current) return; // Don't interfere with dragging

            const acc = e.accelerationIncludingGravity;
            if (!acc || acc.x === null || acc.y === null) return;

            const accX = acc.x ?? 0;
            const accY = acc.y ?? 0;

            // Kalibrierung: Erste Messung als Neutral-Position speichern
            if (!isCalibrated) {
                calibrationX = accX;
                calibrationY = accY;
                isCalibrated = true;
                return;
            }

            // Deadzone: Nur reagieren wenn Neigung stark genug ist
            const deadzone = 2.5; // m/s² Deadzone-Bereich

            // Berechne Abweichung von AKTUELLER Kalibrierungs-Position
            const deltaX = accX - calibrationX;
            const deltaY = accY - calibrationY;

            // Nur reagieren wenn außerhalb der Deadzone
            const effectiveX = Math.abs(deltaX) > deadzone ? deltaX - Math.sign(deltaX) * deadzone : 0;
            const effectiveY = Math.abs(deltaY) > deadzone ? deltaY - Math.sign(deltaY) * deadzone : 0;

            // Wenn keine signifikante Bewegung, Motion-Modus beenden
            if (effectiveX === 0 && effectiveY === 0) {
                if (isUsingMotionRef.current) {
                    isUsingMotionRef.current = false;
                }
                return;
            }

            // Mark that motion is being used
            if (!isUsingMotionRef.current) {
                isUsingMotionRef.current = true;
            }

            // Clear timeout if exists
            if (motionTimeoutRef.current) {
                clearTimeout(motionTimeoutRef.current);
            }

            // Set timeout to reset motion flag after 200ms of no significant motion
            motionTimeoutRef.current = setTimeout(() => {
                isUsingMotionRef.current = false;
            }, 200);

            // Kontinuierliche Rotation basierend auf Neigung
            // Sensitivity: Wie schnell der Würfel sich dreht
            const rotationSpeed = 0.8; // Grad pro Frame

            // Rotation velocity basierend auf Neigung
            const velocityX = effectiveY * rotationSpeed;
            const velocityY = -effectiveX * rotationSpeed;

            setRotation((prev: Rotation) => ({
                x: prev.x + velocityX,
                y: prev.y + velocityY,
            }));
        };

        window.addEventListener('devicemotion', handleDeviceMotion);

        window.addEventListener('devicemotion', handleDeviceMotion);

        return () => {
            window.removeEventListener('devicemotion', handleDeviceMotion);
            if (motionTimeoutRef.current) {
                clearTimeout(motionTimeoutRef.current);
            }
        };
    }, []);

    return { rotation, containerRef, cubeRef };
}
