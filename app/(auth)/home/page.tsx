"use client";

import { Suspense, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { redirect } from "next/navigation";
import { usePortfolioStore } from "@/store/portfolio-store";
import { cn } from "@/lib/utils";

import { ChatContainer } from "@/components/chat-container";
import { PortfolioContainer } from "@/components/portfolio-container";
import { SideNav } from "@/components/side-nav";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarContent } from "@/components/sidebar-content";

export default function HomePage() {
    const { ready, authenticated } = usePrivy();
    const [lastFocusedSection, setLastFocusedSection] = useState<"chat" | "portfolio" | null>(null);

    if (ready && !authenticated) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen relative">
            <div className="flex gap-3 px-2 py-3 h-screen">
                {/* Left Aside */}
                <div className="flex flex-row w-[350px] max-h-full h-full gap-2 ">
                    <SidebarProvider className="!min-h-fit !h-full !w-12">
                        <SideNav className="h-full" />
                    </SidebarProvider>

                    <SidebarContent className="flex-1 h-full max-w-[calc(350px-3.5rem)]" />
                </div>

                {/* Main Container */}
                <div className="flex flex-row w-full h-full gap-2">
                    <ChatContainer
                        className={cn(
                            "frosted-glass h-full rounded-6xl",
                            lastFocusedSection === "chat" ? "w-2/3" : "w-1/2"
                        )}
                        onFocus={() => setLastFocusedSection("chat")}
                    />
                    <PortfolioContainer
                        className="frosted-glass flex-1 w-full h-full rounded-6xl select-none"
                        onFocus={() => setLastFocusedSection("portfolio")}
                        lastFocus={lastFocusedSection}
                    />
                </div>
            </div>
        </div>
    );
}
