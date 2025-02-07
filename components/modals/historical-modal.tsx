"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogOverlay,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface HistoricalModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function HistoricalModal({ open, onOpenChange }: HistoricalModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogOverlay className="backdrop-blur-sm bg-transparent" />
            <DialogContent
                className={cn(
                    "sm:max-w-[500px]",
                    "max-h-[calc(100vh-10rem)]",
                    "bg-neutral-900/70",
                    "text-white",
                    "overflow-y-auto",
                    "!rounded-3xl"
                )}
            >
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Historical Data</DialogTitle>
                </DialogHeader>

                <div className="flex items-center justify-center h-[200px]">
                    <p className="text-lg text-slate-400">Coming Soon</p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
