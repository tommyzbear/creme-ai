"use client";

import { usePrivy } from "@privy-io/react-auth";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useChatStore } from "@/stores/chat-store";

import { ChatContainer } from "@/components/chat-container";
import { PortfolioContainer } from "@/components/portfolio-container";

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
        <div className="flex flex-row w-full h-full gap-2">
            <ChatContainer
                className={cn(
                    "frosted-glass h-full rounded-6xl 4xl:rounded-9xl",
                    lastFocusedSection === "chat" ? "w-2/3" : "w-1/2"
                )}
                onFocus={() => setLastFocusedSection("chat")}
                sessionName={sessionName}
                setSessionName={setSessionName}
                startNewChat={startNewChat}
            />
            <PortfolioContainer
                className="frosted-glass flex-1 w-full h-full rounded-6xl 4xl:rounded-9xl select-none"
                onFocus={() => setLastFocusedSection("portfolio")}
                lastFocus={lastFocusedSection}
            />
        </div>
    );
}
