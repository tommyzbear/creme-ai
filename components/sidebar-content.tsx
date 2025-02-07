import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { AccountCard } from "@/components/account-card";
import { SwitchChainSidebar } from "@/components/switch-chain-sidebar";
import { AppStatus } from "@/components/app-status";
import { AccountModal } from "@/components/modals/account-modal";
import { cn } from "@/lib/utils";
import { ChatHistory } from "./chat-history";
import { useChatStore } from "@/stores/chat-store";

export function SidebarContent({ className }: { className?: string }) {
    const [accountModalOpen, setAccountModalOpen] = useState(false);
    const { sessionId, setSessionId, isNewSession } = useChatStore();
    const chatHistoryRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Only scroll to top when a new session is created
        if (isNewSession && chatHistoryRef.current) {
            chatHistoryRef.current.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    }, [sessionId, isNewSession]);

    return (
        <div className={cn("", className)}>
            <div className="flex flex-col gap-1 h-full">
                <AccountCard onAccountClick={() => setAccountModalOpen(true)} />
                <Card className="flex-1">
                    <div className="p-6">
                        <h3 className="text-sm text-black">
                            AI Manager Insight for the day <br /> or latest summary of tweets?
                        </h3>
                    </div>
                </Card>
                <Card className="flex-1 overflow-hidden">
                    <ChatHistory
                        ref={chatHistoryRef}
                        onSelectSession={setSessionId}
                        currentSessionId={sessionId}
                    />
                </Card>
                <SwitchChainSidebar />
                <AppStatus />
            </div>

            <AccountModal open={accountModalOpen} onOpenChange={setAccountModalOpen} />
        </div>
    );
}
