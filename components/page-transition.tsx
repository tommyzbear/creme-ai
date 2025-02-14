"use client";

import { motion } from "framer-motion";

interface PageTransitionProps {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}

export default function PageTransition({ children, delay = 0, className }: PageTransitionProps) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.4,
                delay: delay,
                ease: "easeOut",
            }}
        >
            {children}
        </motion.div>
    );
}
