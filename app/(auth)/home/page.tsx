"use client";

import { usePrivy } from "@privy-io/react-auth";
import { redirect } from "next/navigation";
import { ChatContainer } from "@/components/chat-container";
import { cn } from "@/lib/utils";
import { PortfolioContainer } from "@/components/portfolio-container";
import { useEffect, useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SideNav } from "@/components/side-nav";
import { useChatStore } from "@/stores/chat-store";
import { SidebarContent } from "@/components/sidebar-content";

export default function HomePage() {
    const { ready, authenticated } = usePrivy();
    const [lastFocusedSection, setLastFocusedSection] = useState<"chat" | "portfolio" | null>(null);
    const { sessionName, setSessionName, startNewChat, fetchSessions } = useChatStore();

    if (ready && !authenticated) {
        redirect("/login");
    }

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    return (
        <div className="min-h-screen relative">
            <div className="flex gap-3 px-2 py-3 h-screen">
                {/* Left Aside */}
                <div className="flex flex-row w-[21rem] max-h-full h-full gap-2 ">
                    <SidebarProvider className="!min-h-fit !h-full !max-w-12">
                        <SideNav className="h-full max-w-full" />
                    </SidebarProvider>

                    <SidebarContent className="flex-1 h-full max-w-[calc(21rem-3.5rem)]" />
                </div>

                {/* Main Container */}
                <div className="flex flex-row w-full h-full gap-2">
                    <ChatContainer
                        className={cn(
                            "frosted-glass h-full rounded-6xl",
                            lastFocusedSection === "chat" ? "w-2/3" : "w-1/2"
                        )}
                        onFocus={() => setLastFocusedSection("chat")}
                        sessionName={sessionName}
                        setSessionName={setSessionName}
                        startNewChat={startNewChat}
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
