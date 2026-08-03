"use client";

import React, { useState, useEffect, useRef } from "react";

export interface AnimatedCounterProps {
    targetValue: number;
    prefix?: string;
    suffix?: string;
    duration?: number;
    delay?: number;
    className?: string;
}

/**
 * Animated number counter component that counts up smoothly with a staggered delay when scrolled into view.
 */
export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
    targetValue,
    prefix = "",
    suffix = "",
    duration = 1800,
    delay = 0,
    className = "",
}): React.ReactElement => {
    const [count, setCount] = useState<number>(0);
    const elementRef = useRef<HTMLSpanElement>(null);
    const hasAnimatedRef = useRef<boolean>(false);

    useEffect(() => {
        const node = elementRef.current;
        if (!node) return;

        let timerId: NodeJS.Timeout;

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry && entry.isIntersecting && !hasAnimatedRef.current) {
                    hasAnimatedRef.current = true;

                    timerId = setTimeout(() => {
                        const startTime = performance.now();

                        const animate = (currentTime: number) => {
                            const elapsed = currentTime - startTime;
                            const progress = Math.min(elapsed / duration, 1);

                            // Smooth decelerating cubic ease-out curve
                            const easeProgress = 1 - Math.pow(1 - progress, 3);
                            const currentCount = Math.floor(easeProgress * targetValue);

                            setCount(currentCount);

                            if (progress < 1) {
                                requestAnimationFrame(animate);
                            } else {
                                setCount(targetValue);
                            }
                        };

                        requestAnimationFrame(animate);
                    }, delay);
                }
            },
            { threshold: 0.3 }
        );

        observer.observe(node);

        return () => {
            if (timerId) clearTimeout(timerId);
            observer.disconnect();
        };
    }, [targetValue, duration, delay]);

    return (
        <span ref={elementRef} className={`tabular-nums inline-block ${className}`}>
            {prefix}
            {count.toLocaleString()}
            {suffix}
        </span>
    );
};
