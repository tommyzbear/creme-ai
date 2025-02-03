"use client";

import React from "react";

export default function BlurredCursor() {
    const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

    // Calculate offset based on viewport width
    const offset = React.useMemo(() => {
        return window.innerWidth * 0.05; // 10vw (half of 20vw)
    }, []);

    React.useEffect(() => {
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
                transform: `translate(${mousePosition.x - offset}px, ${
                    mousePosition.y - offset
                }px)`,
                transition: "transform 1.2s linear",
            }}
        >
            <div
                className="rounded-full bg-radial 
                    from-sky-600 via-sky-400 to-transparent
                    opacity-100 blur-[5rem]"
                style={{
                    height: `${2 * offset}px`,
                    width: `${2 * offset}px`,
                }}
            />
        </div>
    );
}
