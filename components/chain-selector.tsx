"use client";

import { NetworkIcon } from "@/components/ui/network-icon";

import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useWallets } from "@privy-io/react-auth";
import { getNetworkByChainId } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { config } from "@/lib/wallet/config";
import { usePortfolioStore } from "@/stores/portfolio-store";
import { useState } from "react";

interface ChainSelectorProps {
    value?: string;
    onValueChange?: (value: string) => void;
    disabledChains?: string[];
}

export function ChainSelector({ value, onValueChange, disabledChains }: ChainSelectorProps) {
    const { wallets, ready } = useWallets();
    const { toast } = useToast();
    const { currentChainId, setCurrentChainId } = usePortfolioStore();

    const handleSwitchNetwork = async (chainId: string) => {
        if (!wallets[0]) return;
        try {
            await wallets[0].switchChain(Number(chainId));
            setCurrentChainId(`eip155:${chainId}`);
            toast({
                description: "Network switched successfully",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: `Failed to switch network ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            });
        }
    };

    const getCurrentNetwork = () => {
        if (!ready || !wallets[0]) return "Ethereum";
        return getNetworkByChainId(wallets[0].chainId);
    };

    return (
        <SidebarMenu className="focus:ring-0 focus:outline-none ">
            <SidebarMenuItem className="focus:ring-0 focus:outline-none">
                <Select
                    value={currentChainId}
                    onValueChange={handleSwitchNetwork}
                    disabled={!wallets[0]}
                >
                    <SelectTrigger className="w-full border-0 focus:ring-0 focus:outline-none rounded-3xl frosted-glass bg-background/40">
                        <SelectValue placeholder="Select network">
                            <div className="flex items-center space-x-3">
                                <NetworkIcon chain={getCurrentNetwork()} className="w-6 h-6" />
                                <div>
                                    <p className="font-medium">{getCurrentNetwork()}</p>
                                </div>
                            </div>
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="focus:ring-0 focus:outline-none rounded-3xl">
                        {config.chains.map((chain) => (
                            <SelectItem
                                key={chain.id}
                                value={chain.id.toString()}
                                className="transition-all duration-100 rounded-3xl"
                                disabled={disabledChains?.includes(`eip155:${chain.id}`)}
                            >
                                <div className="flex items-center space-x-3">
                                    <NetworkIcon chain={chain.name} className="w-6 h-6" />
                                    <div>
                                        <p className="font-medium">
                                            {chain.name}
                                            {disabledChains?.includes(`eip155:${chain.id}`)
                                                ? " (soon)"
                                                : ""}
                                        </p>
                                    </div>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
