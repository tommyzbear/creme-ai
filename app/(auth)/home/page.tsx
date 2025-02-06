"use client";

import { Card } from "@/components/ui/card";
import { usePrivy } from "@privy-io/react-auth";
import { redirect, useRouter } from "next/navigation";
import { ChatContainer } from "@/components/chat-container";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { PortfolioContainer } from "@/components/portfolio-container";
import { Suspense, useState } from "react";
import { SwitchChainSidebar } from "@/components/switch-chain-sidebar";
import { usePortfolioStore } from "@/store/portfolio-store";
import { WalletSelector } from "@/components/wallet-selector";
import { AppStatus } from "@/components/app-status";
import { AccountDialog } from "@/components/dialogs/account-dialog";
import { SideNav } from "@/components/side-nav";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function HomePage() {
    const { ready, authenticated } = usePrivy();
    const [lastFocusedSection, setLastFocusedSection] = useState<"chat" | "portfolio" | null>(null);
    const { selectedWalletAddress, managedWallet, setSelectedWalletAddress } = usePortfolioStore();
    const router = useRouter();
    const [accountDialogOpen, setAccountDialogOpen] = useState(false);

    if (ready && !authenticated) {
        redirect("/login");
    }

    const handleWalletChange = (address: string) => {
        setSelectedWalletAddress(address);
    };

    return (
        <div className="min-h-screen relative">
            <div className="flex gap-3 px-2 py-3 h-screen">
                {/* Sidebar */}
                <div className="flex flex-row w-[400px] max-h-full h-full gap-2">
                    <SidebarProvider>
                        <AppSidebar />
                    </SidebarProvider>

                    <SidebarProvider className="!min-h-fit !h-full">
                        <SideNav className="w-full h-full" />
                    </SidebarProvider>

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
                                    <h3 className="text-sm">Last actions done by creme agent?</h3>
                                </div>
                            </Card>
                            <AppStatus />
                        </div>
                    </div>
                </div>

                {/* Main Container */}
                {/* <div className="flex flex-row w-full h-full gap-2">
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
                </div> */}
            </div>

            <AccountDialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen} />
        </div>
    );
}
