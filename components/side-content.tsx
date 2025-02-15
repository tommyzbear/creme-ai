"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { AccountCard } from "@/components/account-card";
import { ChainSelector } from "@/components/chain-selector";
import { AppStatus } from "@/components/app-status";
import { AccountModal } from "@/components/modals/account-modal";
import { cn } from "@/lib/utils";
import { ChatHistory } from "./chat-history";
import { useChatStore } from "@/stores/chat-store";
import { useSafeChatStore } from "@/stores/safe-chat-store";
import { usePathname } from "next/navigation";
import { NewsFeed } from "@/components/news-feed";
import { useNewsStore } from "@/stores/news-store";

export function SideContent({ className }: { className?: string }) {
    const pathname = usePathname();
    const isSafePath = pathname?.endsWith('/safe');

    const {
        sessionId,
        setSessionId,
        isNewSession,
        isLoading,
        sessions
    } = useChatStore();

    const {
        sessionId: safeSessionId,
        setSessionId: setSafeSessionId,
        isNewSession: isSafeNewSession,
        isLoading: isSafeLoading,
        sessions: safeSessions
    } = useSafeChatStore();

    const [accountModalOpen, setAccountModalOpen] = useState(false);
    const chatHistoryRef = useRef<HTMLDivElement>(null);
    const { news, isLoading: newsLoading } = useNewsStore();

    useEffect(() => {
        // Only scroll to top when a new session is created
        if ((isNewSession || isSafeNewSession) && chatHistoryRef.current) {
            chatHistoryRef.current.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    }, [sessionId, isNewSession, isSafeNewSession]);

    return (
        <div className={cn("", className)}>
            <div className="flex flex-col gap-1 h-full">
                <AccountCard onAccountClick={() => setAccountModalOpen(true)} />
                <Card className="flex-1 overflow-hidden">
                    <NewsFeed news={news} isLoading={newsLoading} />
                </Card>
                <Card className="flex-1 overflow-hidden">
                    <ChatHistory
                        ref={chatHistoryRef}
                        onSelectSession={isSafePath ? setSafeSessionId : setSessionId}
                        currentSessionId={isSafePath ? safeSessionId : sessionId}
                        isLoading={isSafePath ? isSafeLoading : isLoading}
                        sessions={isSafePath ? safeSessions : sessions}
                    />
                </Card>
                <ChainSelector />
                <AppStatus />
            </div>

            <AccountModal open={accountModalOpen} onOpenChange={setAccountModalOpen} />
        </div>
    );
}
