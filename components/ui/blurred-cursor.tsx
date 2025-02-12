"use client";

import { useState, useEffect } from "react";

export default function BlurredCursor() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        // Set initial offset
        setOffset(window.innerWidth * 0.1);

        // Optional: Update offset on window resize
        const handleResize = () => {
            setOffset(window.innerWidth * 0.1);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <div
            className="absolute pointer-events-none"
            style={{
                transform: `translate(calc(${mousePosition.x}px - 50vw), calc(${mousePosition.y}px - 50vh))`,
                transition: "transform 1.2s linear",
            }}
        >
            <div
                className="rounded-full bg-radial 
                    from-sky-600 via-sky-400 to-transparent
                    opacity-100 blur-[3rem]"
                style={{
                    height: `${offset}px`,
                    width: `${offset}px`,
                }}
            />
        </div>
    );
}
