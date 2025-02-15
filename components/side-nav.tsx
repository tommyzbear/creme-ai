"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Home, Settings, ChartNoAxesCombined, History, Vault, UserRoundCog } from "lucide-react";
import { SettingsModal } from "@/components/modals/settings-modal";
import { AnalyticsModal } from "@/components/modals/analytics-modal";
import { HistoricalModal } from "@/components/modals/historical-modal";
import { Preference } from "@/types/data";
import { PreferencesDialog } from "./modals/preferences-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SideNavProps {
    className?: string;
    preferences: Partial<Preference>;
    setPreferences: (
        preferences: Partial<Preference> | ((prev: Partial<Preference>) => Partial<Preference>)
    ) => void;
    setShowPreferences: (show: boolean) => void;
    showPreferences: boolean;
}

export function SideNav({
    className,
    preferences,
    setPreferences,
    setShowPreferences,
    showPreferences,
}: SideNavProps) {
    const [showSettings, setShowSettings] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [showHistory, setShowHistorical] = useState(false);
    const tooltipDelay = 500;

    return (
        <div className={cn(" overflow-visible", className)}>
            <div className="flex flex-col gap-1 h-full">
                <Link
                    href="/home"
                    className={cn(
                        "flex justify-center items-center h-full max-h-[140px] bg-black/90 rounded-3xl cursor-pointer shrink-0",
                        "hover:bg-accent hover:shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all duration-200 shadow-lg"
                    )}
                >
                    <span
                        className={cn(
                            "font-shrikhand not-italic",
                            "rotate-[270deg] text-white text-2xl font-medium whitespace-nowrap"
                        )}
                    >
                        crème'ai
                    </span>
                </Link>
                <div className="flex-1 min-h-0 bg-black/90 flex flex-col rounded-3xl items-center">
                    <TooltipProvider>
                        <Tooltip delayDuration={tooltipDelay}>
                            <TooltipTrigger asChild>
                                <Link
                                    href="/home"
                                    className="flex flex-col items-center gap-5 py-3 pt-4"
                                >
                                    <Home className="w-6 h-6 text-neutral-400 hover:text-white cursor-pointer transition-colors" />
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent
                                className="p-2 rounded-xl"
                                side="right"
                                align="center"
                                sideOffset={20}
                            >
                                <p className="text-sm">Home</p>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip delayDuration={tooltipDelay}>
                            <TooltipTrigger asChild>
                                <Link
                                    href="/safe"
                                    className="flex flex-col items-center gap-5 py-3"
                                >
                                    <Vault className="w-6 h-6 text-neutral-400 hover:text-white cursor-pointer transition-colors" />
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent
                                className="p-2 rounded-xl"
                                side="right"
                                align="center"
                                sideOffset={20}
                            >
                                <p className="text-sm">Safe</p>
                            </TooltipContent>
                        </Tooltip>

                        <div className="p-3 mt-auto flex flex-col justify-center gap-5">
                            <TooltipProvider>
                                <Tooltip delayDuration={tooltipDelay}>
                                    <TooltipTrigger asChild>
                                        <History
                                            className="w-6 h-6 text-neutral-400 hover:text-white cursor-pointer transition-colors"
                                            onClick={() => setShowHistorical(true)}
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent
                                        className="p-2 rounded-xl"
                                        side="right"
                                        align="center"
                                        sideOffset={20}
                                    >
                                        <p className="text-sm">Historical Data</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip delayDuration={tooltipDelay}>
                                    <TooltipTrigger asChild>
                                        <ChartNoAxesCombined
                                            className="w-6 h-6 text-neutral-400 hover:text-white cursor-pointer transition-colors"
                                            onClick={() => setShowAnalytics(true)}
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent
                                        className="p-2 rounded-xl"
                                        side="right"
                                        align="center"
                                        sideOffset={20}
                                    >
                                        <p className="text-sm">Custom Analytics</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip delayDuration={tooltipDelay}>
                                    <TooltipTrigger asChild>
                                        <UserRoundCog
                                            className="w-6 h-6 text-neutral-400 hover:text-white cursor-pointer transition-colors"
                                            onClick={() => setShowPreferences(true)}
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent
                                        className="p-2 rounded-xl"
                                        side="right"
                                        align="center"
                                        sideOffset={20}
                                    >
                                        <p className="text-sm">Investor Profile</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip delayDuration={tooltipDelay}>
                                    <TooltipTrigger asChild>
                                        <Settings
                                            className="mb-1 w-6 h-6 text-neutral-400 hover:text-white cursor-pointer transition-colors"
                                            onClick={() => setShowSettings(true)}
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent
                                        className="p-2 rounded-xl"
                                        side="right"
                                        align="center"
                                        sideOffset={20}
                                    >
                                        <p className="text-sm">Settings</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </TooltipProvider>
                </div>
            </div>
            <SettingsModal open={showSettings} onOpenChange={setShowSettings} />
            <AnalyticsModal open={showAnalytics} onOpenChange={setShowAnalytics} />
            <HistoricalModal open={showHistory} onOpenChange={setShowHistorical} />
            <PreferencesDialog
                preferences={preferences}
                setPreferences={setPreferences}
                open={showPreferences}
                onOpenChange={setShowPreferences}
            />
        </div>
    );
}
