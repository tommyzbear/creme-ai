"use client";

import { motion } from "framer-motion";

interface PageTransitionProps {
    children: React.ReactNode;
    delay?: number;
}

export default function PageTransition({ children, delay = 0 }: PageTransitionProps) {
    return (
        <motion.div
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
