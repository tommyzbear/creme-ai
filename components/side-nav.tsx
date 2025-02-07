"use client";

import { Shrikhand } from "next/font/google";
const shrikhand = Shrikhand({ weight: "400", style: "normal", subsets: ["latin"], display: "swap" });

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Settings, ChartNoAxesCombined, History } from "lucide-react";
import { SettingsModal } from "@/components/modals/settings-modal";
import { AnalyticsModal } from "@/components/modals/analytics-modal";
import { HistoricalModal } from "@/components/modals/historical-modal";
export function SideNav({ className }: { className?: string }) {
    const [showSettings, setShowSettings] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [showHistory, setShowHistorical] = useState(false);

    return (
        <div className={cn(" overflow-visible", className)}>
            <div className="flex flex-col gap-1 h-full">
                <div
                    className={cn(
                        "flex justify-center items-center h-full max-h-[140px] bg-black/90 rounded-3xl cursor-pointer shrink-0",
                        "hover:bg-accent hover:shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all duration-200 shadow-lg"
                    )}
                >
                    <span
                        className={cn(
                            shrikhand.className,
                            "rotate-[270deg] text-white text-2xl font-medium whitespace-nowrap"
                        )}
                    >
                        crème'ai
                    </span>
                </div>
                <div className="flex-1 min-h-0 bg-black/90 flex flex-col rounded-3xl">
                    <div className="p-3 mt-auto flex flex-col justify-center gap-5">
                        <History
                            className="w-6 h-6 text-white/50 hover:text-white cursor-pointer transition-colors"
                            onClick={() => setShowHistorical(true)}
                        />
                        <ChartNoAxesCombined
                            className="w-6 h-6 text-white/50 hover:text-white cursor-pointer transition-colors"
                            onClick={() => setShowAnalytics(true)}
                        />
                        <Settings
                            className="w-6 h-6 text-white/50 hover:text-white cursor-pointer transition-colors"
                            onClick={() => setShowSettings(true)}
                        />
                    </div>
                </div>
            </div>
            <SettingsModal open={showSettings} onOpenChange={setShowSettings} />
            <AnalyticsModal open={showAnalytics} onOpenChange={setShowAnalytics} />
            <HistoricalModal open={showHistory} onOpenChange={setShowHistorical} />
        </div>
    );
}
