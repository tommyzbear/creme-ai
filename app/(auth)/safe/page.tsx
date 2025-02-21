"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { parseEther } from "viem";
import { StakeKitDefi } from "@/components/StakeKitDefi";
import { useSafeStore } from "@/store/safeStore";
import { TokensTable } from "@/components/tokens-table";
import { TokensLending } from "@/components/tokens-lending";
import { TokensLiquidityProvider } from "@/components/tokens-liquidity-provider";
import { TokensUnstake } from "@/components/tokens-unstake";
import { StakeKitPositions } from "@/components/stake-kit-positions";
import { SafeChatContainer } from "@/components/safe-chat-container";
import { cn } from "@/lib/utils";
import { useSafeChatStore } from "@/stores/safe-chat-store";
import { SafePortfolioContainer } from "@/components/safe-portfolio-container";

export default function SafePage() {
    const { user } = usePrivy();
    const [lastFocusedSection, setLastFocusedSection] = useState<"chat" | "portfolio" | null>(null);
    const { wallets } = useWallets();
    const { toast } = useToast();
    const [isCreating, setIsCreating] = useState(false);
    const [isWrapping, setIsWrapping] = useState(false);
    const [ethAmount, setEthAmount] = useState("");
    const {
        safeAddress,
        setSafeAddress,
        fetchSafeAddress,
        selectedChain,
        setSelectedChain,
        balances,
        fetchBalances,
        isLoading,
    } = useSafeStore();
    const { fetchSessions } = useSafeChatStore();

    const { sessionName, startNewChat, setSessionName } = useSafeChatStore();

    const managedWallet = wallets.find((w) => w.walletClientType === "privy");

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    useEffect(() => {
        if (!safeAddress) {
            fetchSafeAddress();
        }
    }, [fetchSafeAddress, safeAddress]);

    useEffect(() => {
        if (safeAddress) {
            fetchBalances();
        }
    }, [fetchBalances, safeAddress, selectedChain]);

    const handleCreateSafe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.wallet?.address || !managedWallet?.address) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Please connect your wallets first",
            });
            return;
        }

        if (user?.wallet?.address === managedWallet?.address) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "BETA version! Please connect your wallet to provide extra signer",
            });
            return;
        }

        setIsCreating(true);
        try {
            const response = await fetch("/api/safe/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    embeddedWalletAddress: managedWallet.address,
                    ownerAddress: user.wallet.address,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setSafeAddress(data.safeAddress);
            toast({
                title: "Success",
                description: "Safe created successfully",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create safe",
            });
        } finally {
            setIsCreating(false);
        }
    };

    const handleWrapEth = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!safeAddress || !ethAmount) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Please fill in all fields",
            });
            return;
        }

        setIsWrapping(true);
        try {
            const inputAmount = parseEther(ethAmount).toString();
            const response = await fetch("/api/safe/wrap-eth", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    chainId: selectedChain,
                    inputAmount,
                    safeAddress,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            toast({
                title: "Success",
                description: `Successfully wrapped ${ethAmount} ETH to WETH`,
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to wrap ETH",
            });
        } finally {
            setIsWrapping(false);
        }
    };

    return (
        <div className="flex flex-row w-full h-full gap-2">
            <SafeChatContainer
                className={cn(
                    "frosted-glass h-full rounded-6xl 4xl:rounded-9xl",
                    lastFocusedSection === "chat" ? "w-2/3" : "w-1/2"
                )}
                onFocus={() => setLastFocusedSection("chat")}
                sessionName={sessionName}
                setSessionName={setSessionName}
                startNewChat={startNewChat}
            />
            <SafePortfolioContainer
                className="frosted-glass flex-1 w-full h-full rounded-6xl 4xl:rounded-9xl select-none"
                onFocus={() => setLastFocusedSection("portfolio")}
                lastFocus={lastFocusedSection}
            />
            <div className="justify-between items-center hidden">
                <h1 className="text-3xl font-bold">Safe Management</h1>
                <div className="flex items-center gap-4">
                    <div className="w-[200px]">
                        <Select value={selectedChain} onValueChange={setSelectedChain}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select chain" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="eip155:1" disabled>
                                    Ethereum (soon)
                                </SelectItem>
                                <SelectItem value="eip155:10" disabled>
                                    Optimism (soon)
                                </SelectItem>
                                <SelectItem value="eip155:42161">Arbitrum</SelectItem>
                                <SelectItem value="eip155:8453" disabled>
                                    Base (soon)
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {/* {!safeAddress && ( */}
                    <Button onClick={handleCreateSafe} disabled={isCreating}>
                        {isCreating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            "Deploy Safe"
                        )}
                    </Button>
                    {/* )} */}
                </div>
            </div>

            <div className="overflow-y-auto h-full space-y-8 hidden">
                {safeAddress && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Safe Details</CardTitle>
                            <CardDescription>
                                Your newly created Safe wallet details
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div>
                                        <Label>Safe Address</Label>
                                        <p className="font-mono text-sm mt-1">{safeAddress}</p>
                                    </div>
                                    <Separator />
                                    <div>
                                        <Label>Chain</Label>
                                        <p className="text-sm mt-1">
                                            {selectedChain === "eip155:1" && "Ethereum"}
                                            {selectedChain === "eip155:10" && "Optimism"}
                                            {selectedChain === "eip155:42161" && "Arbitrum"}
                                            {selectedChain === "eip155:8453" && "Base"}
                                        </p>
                                    </div>
                                    <Separator />
                                    <div>
                                        <Label>Owners</Label>
                                        <div className="space-y-1 mt-1">
                                            <p className="font-mono text-sm">
                                                {user?.wallet?.address}
                                            </p>
                                            <p className="font-mono text-sm">
                                                {managedWallet?.address}
                                            </p>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div>
                                        <Label>Portfolio Balances</Label>
                                        <div className="mt-2 space-y-2">
                                            <TokensTable
                                                tokens={balances}
                                                totalValue={balances.reduce(
                                                    (acc, token) => acc + Number(token.value),
                                                    0
                                                )}
                                                isLoading={isLoading}
                                                isExpanded={true}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="space-y-8 pb-8">
                    <div className="grid gap-8 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Wrap ETH</CardTitle>
                                <CardDescription>
                                    Wrap ETH to WETH and approve for trading
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleWrapEth} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="safeAddress">Safe Address</Label>
                                        <Input
                                            id="safeAddress"
                                            value={safeAddress}
                                            onChange={(e) => setSafeAddress(e.target.value)}
                                            placeholder="0x..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="ethAmount">ETH Amount</Label>
                                        <Input
                                            id="ethAmount"
                                            type="number"
                                            step="0.000000000000000001"
                                            value={ethAmount}
                                            onChange={(e) => setEthAmount(e.target.value)}
                                            placeholder="0.0"
                                        />
                                    </div>

                                    <Button type="submit" disabled={isWrapping} className="w-full">
                                        {isWrapping ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Wrapping...
                                            </>
                                        ) : (
                                            "Wrap ETH"
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <StakeKitDefi safeAddress={safeAddress} selectedChain={selectedChain} />
                        <StakeKitPositions chainId={selectedChain} />
                    </div>

                    <div className="grid gap-8 md:grid-cols-3">
                        <TokensLending
                            balances={balances}
                            safeAddress={safeAddress}
                            selectedChain={selectedChain}
                        />
                        <TokensLiquidityProvider
                            balances={balances}
                            safeAddress={safeAddress}
                            selectedChain={selectedChain}
                        />
                        <TokensUnstake
                            balances={balances.filter((token) => token.type === "defi")}
                            safeAddress={safeAddress}
                            selectedChain={selectedChain}
                        />
                    </div>

                    <div className="flex gap-4">
                        <Button
                            onClick={async () => {
                                try {
                                    const response = await fetch("/api/safe/unstake", {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                            chainId: selectedChain,
                                            safeAddress,
                                        }),
                                    });

                                    if (!response.ok) {
                                        const data = await response.json();
                                        throw new Error(data.error);
                                    }

                                    toast({
                                        title: "Success",
                                        description: "Unstake request submitted successfully",
                                    });
                                } catch (error) {
                                    toast({
                                        variant: "destructive",
                                        title: "Error",
                                        description:
                                            error instanceof Error
                                                ? error.message
                                                : "Failed to unstake",
                                    });
                                }
                            }}
                        >
                            Unstake All
                        </Button>

                        <Button
                            onClick={async () => {
                                try {
                                    const response = await fetch("/api/safe/swap-to-weth", {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                            chainId: selectedChain,
                                            safeAddress,
                                        }),
                                    });

                                    if (!response.ok) {
                                        const data = await response.json();
                                        throw new Error(data.error);
                                    }

                                    toast({
                                        title: "Success",
                                        description: "Swap to WETH request submitted successfully",
                                    });
                                } catch (error) {
                                    toast({
                                        variant: "destructive",
                                        title: "Error",
                                        description:
                                            error instanceof Error
                                                ? error.message
                                                : "Failed to swap to WETH",
                                    });
                                }
                            }}
                        >
                            Swap All to WETH
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
