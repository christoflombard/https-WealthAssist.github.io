"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
    end: number;
    duration?: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
    className?: string;
}

export default function CountUp({
    end,
    duration = 2000,
    prefix = "",
    suffix = "",
    decimals = 0,
    className = "",
}: CountUpProps) {
    const [count, setCount] = useState(0);
    const countRef = useRef<HTMLSpanElement>(null);
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !hasAnimated) {
                    setHasAnimated(true);
                }
            },
            { threshold: 0.5 } // Trigger when 50% visible
        );

        if (countRef.current) {
            observer.observe(countRef.current);
        }

        return () => observer.disconnect();
    }, [hasAnimated]);

    useEffect(() => {
        if (!hasAnimated) return;

        let startTime: number | null = null;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);

            // Easing function (easeOutExpo)
            const easeOut = (x: number): number => {
                return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
            };

            const currentCount = easeOut(percentage) * end;
            setCount(currentCount);

            if (progress < duration) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                setCount(end); // Ensure it lands exactly on end value
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [hasAnimated, end, duration]);

    return (
        <span ref={countRef} className={className}>
            {prefix}
            {count.toFixed(decimals)}
            {suffix}
        </span>
    );
}
