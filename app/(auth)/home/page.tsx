"use client";

import { Card } from "@/components/ui/card";
import { usePrivy } from "@privy-io/react-auth";
import { redirect, useRouter } from "next/navigation";
import { ChatContainer } from "@/components/chat-container";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { PortfolioContainer } from "@/components/portfolio-container";
import { Suspense, useEffect, useState } from "react";
import { SwitchChainSidebar } from "@/components/switch-chain-sidebar";
import { usePortfolioStore } from "@/stores/portfolio-store";
import { WalletSelector } from "@/components/wallet-selector";
import { AppStatus } from "@/components/app-status";
import { AccountDialog } from "@/components/dialogs/account-dialog";
// import { SideNav } from "@/components/side-nav";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarContent, SidebarProvider } from "@/components/ui/sidebar";
import { SideNav } from "@/components/side-nav";
import { ChatHistory } from "@/components/chat-history";
import { useChatStore } from "@/stores/chat-store";


export default function HomePage() {
    const { ready, authenticated } = usePrivy();
    const [lastFocusedSection, setLastFocusedSection] = useState<"chat" | "portfolio" | null>(null);
    const { selectedWalletAddress, managedWallet, setSelectedWalletAddress } = usePortfolioStore();
    const router = useRouter();
    const [accountDialogOpen, setAccountDialogOpen] = useState(false);
    const { sessionId, sessionName, setSessionName, startNewChat, setSessionId, fetchSessions } = useChatStore();

    if (ready && !authenticated) {
        redirect("/login");
    }

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    const handleWalletChange = (address: string) => {
        setSelectedWalletAddress(address);
    };

    return (
        <div className="min-h-screen relative">
            <div className="flex gap-3 px-2 py-3 h-screen">
                {/* Left Aside */}
                <div className="flex flex-row w-[350px] max-h-full h-full gap-2 ">
                    <SidebarProvider className="!min-h-fit !h-full !w-12">
                        <SideNav className="h-full" />
                    </SidebarProvider>

                    <SidebarContent className="flex-1 h-full max-w-[calc(350px-3.5rem)]" />

                    {/* Account Balances */}
                    <div className="flex-1 h-full">
                        <div className="flex flex-col gap-1 h-full">
                            <Card
                                className="flex items-center h-16 pl-2 gap-3 cursor-pointer hover:bg-accent/50 transition-colors"
                                onClick={() => setAccountDialogOpen(true)}
                            >
                                <span className="text-sm">Account info</span>
                            </Card>
                            <WalletSelector
                                selectedWalletAddress={selectedWalletAddress}
                                managedWallet={managedWallet}
                                onWalletChange={handleWalletChange}
                            />
                            <SwitchChainSidebar />
                            <Card className="flex-1">
                                <div className="p-6">
                                    <h3 className="text-sm text-black">
                                        AI Manager Insight for the day <br /> or latest summary of
                                        tweets?
                                    </h3>
                                </div>
                            </Card>
                            <Card className="flex-1">
                                <div className="p-6">
                                    <ChatHistory
                                        onSelectSession={setSessionId}
                                        currentSessionId={sessionId}
                                    />
                                </div>
                            </Card>
                            <AppStatus />
                        </div>
                    </div>
                </div>

                {/* Main Container */}
                <div className="flex flex-row w-full h-full gap-2">
                    <ChatContainer
                        className={cn(
                            "frosted-glass h-full rounded-6xl",
                            lastFocusedSection === "chat" ? "w-2/3" : "w-1/2"
                        )}
                        onFocus={() => setLastFocusedSection("chat")}
                        sessionId={sessionId}
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
