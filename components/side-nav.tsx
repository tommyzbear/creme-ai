"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Settings } from "lucide-react";
import { SettingsModal } from "@/components/settings-modal";

export function SideNav({ className }: { className?: string }) {
    const [showSettings, setShowSettings] = useState(false);

    return (
        <div className={cn("", className)}>
            <div className="flex flex-col gap-1 h-full">
                <div
                    className={cn(
                        "flex justify-center items-center h-16 bg-black/90 rounded-3xl cursor-pointer shrink-0",
                        "backdrop-blur-md backdrop-brightness-125 backdrop-saturate-150"
                    )}
                >
                    {/* Logo */}
                </div>
                <div className="flex-1 min-h-0 bg-black/90 flex flex-col rounded-3xl">
                    <div className="p-3 mt-auto flex justify-center">
                        <Settings
                            className="w-6 h-6 text-white/50 hover:text-white cursor-pointer transition-colors"
                            onClick={() => setShowSettings(true)}
                        />
                    </div>
                </div>
            </div>
            <SettingsModal open={showSettings} onOpenChange={setShowSettings} />
        </div>
    );
}
