"use client";

import { Copy, Check, Loader2 } from "lucide-react";
import { TokensTable } from "@/components/tokens-table";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useSafeStore } from "@/store/safeStore";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { HoldingsDashboard } from "./holdings-dashboard";
import { ChainSelector } from "@/components/chain-selector";
import { NetworkIcon } from "@/components/ui/network-icon";

interface SafePortfolioContainerProps {
    className?: string;
    onFocus?: () => void;
    lastFocus: "chat" | "portfolio" | null;
}

export function SafePortfolioContainer({
    className,
    onFocus,
    lastFocus,
}: SafePortfolioContainerProps) {
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

    const { user } = usePrivy();
    const { wallets } = useWallets();
    const [isCreating, setIsCreating] = useState(false);

    const { toast } = useToast();
    const [isCopied, setIsCopied] = useState(false);
    const [scrollOpacity, setScrollOpacity] = useState(0);
    const portfolioContainerRef = useRef<HTMLDivElement>(null);

    const managedWallet = wallets.find((w) => w.walletClientType === "privy");

    const isPortfolioFocused = (lastFocus: "chat" | "portfolio" | null): boolean => {
        if (lastFocus === null) return true;
        return lastFocus === "portfolio";
    };

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

    useEffect(() => {
        const handleScroll = () => {
            if (portfolioContainerRef.current) {
                const scrollPosition = portfolioContainerRef.current.scrollTop;
                const opacity = Math.min(scrollPosition / 100, 0.3); // Max opacity of 0.3
                setScrollOpacity(opacity);
            }
        };

        const container = portfolioContainerRef.current;
        if (container) {
            container.addEventListener("scroll", handleScroll);
            return () => container.removeEventListener("scroll", handleScroll);
        }
    }, []);

    const isDust = (token: { value: string; quantity: string }) => {
        console.log(token);
        const value = Number(token.value);
        const quantity = Number(token.quantity);
        return value < 0.01 || quantity < 0.00001; // Ignore tiny values and quantities
    };

    const totalValue = balances
        .filter(token => !isDust(token))
        .reduce((sum, token) => sum + Number(token.value), 0);

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setIsCopied(true);
            toast({
                description: "Copied to clipboard",
                duration: 2000,
            });
            setTimeout(() => setIsCopied(false), 1000);
        } catch (error) {
            console.error("Failed to copy:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to copy to clipboard",
            });
        }
    };

    const scrollToTop = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (portfolioContainerRef.current) {
            portfolioContainerRef.current.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    };

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

    const handlePortfolioRefresh = async () => {
        if (!safeAddress) return;

        await fetchBalances();
        toast({
            description: "Portfolio data refreshed",
            duration: 2000,
        });
    };

    return (
        <div
            className={cn("max-w-full mx-auto h-screen overflow-hidden", className)}
            onFocus={() => {
                onFocus?.();
            }}
            onBlur={() => {}}
            tabIndex={0}
        >
            <div
                className="relative w-full mx-auto h-full overflow-y-auto test"
                ref={portfolioContainerRef}
            >
                <header
                    className={`
                sticky top-0 z-10 antialiased frosted-glass flex flex-col items-center 
                w-full shadow-b-sm bg-gradient-to-b main-gradient min-h-[60px]
                backdrop-blur-sm backdrop-brightness-110 pointer-events-auto
            `}
                >
                    <div
                        className="absolute inset-0 bg-gradient-to-b from-background/100 to-transparent transition-opacity duration-300"
                        style={{
                            opacity: Math.max(scrollOpacity, 0.1),
                        }}
                    />
                    <h1
                        className={`
                            pt-3 w-full h-full leading-none
                            flex flex-col justify-center 
                            text-center text-lg font-bold font-bricolage 
                            relative cursor-pointer pointer-events-auto 
                        `}
                        onClick={scrollToTop}
                    >
                        Safe Wallet Details
                    </h1>
                    <div className="flex items-center gap-2 h-6">
                        {isLoading ? (
                            <Skeleton className="h-4 w-28" />
                        ) : (
                            <button
                                className={cn(
                                    "text-sm text-muted-foreground pl-3",
                                    "hover:text-primary transition-colors",
                                    "flex items-center gap-1",
                                    "cursor-pointer pointer-events-auto"
                                )}
                                onClick={() => copyToClipboard(safeAddress || "")}
                                title="Copy address to clipboard"
                                disabled={!safeAddress}
                            >
                                {safeAddress
                                    ? `${safeAddress.slice(0, 6)}...${safeAddress.slice(-4)}`
                                    : "Not Deployed"}
                                {safeAddress &&
                                    (isCopied ? (
                                        <Check className="w-3 h-3 text-green-500" />
                                    ) : (
                                        <Copy className="w-3 h-3 text-gray-500 hover:text-gray-700" />
                                    ))}
                            </button>
                        )}
                    </div>
                </header>

                <Separator />
                {user?.wallet?.address !== managedWallet?.address ? (
                    <>
                        <div className="flex flex-col items-center gap-2 w-full px-4">
                            <div className="flex flex-row items-center gap-10 justify-between">
                                <div className="shrink-0 hover:rotate-[-12deg] transition-all duration-100 ease-out">
                                    <img
                                        src="/logo-b.svg"
                                        alt="Creme puff"
                                        className="my-4 w-24 h-24 animate-float opacity-30"
                                        draggable={false}
                                    />
                                </div>
                                <div className="flex-1 w-full pb-2 justify-start items-start text-left">
                                    <h1 className={`text-lg font-bold font-bricolage text-left`}>
                                        Signers
                                    </h1>
                                    <div className="flex flex-col items-center gap-2 h-6 pt-2 pb-8 transition-all duration-300">
                                        <p className="text-sm text-muted-foreground text-left">
                                            {isPortfolioFocused(lastFocus)
                                                ? user?.wallet?.address
                                                : `${user?.wallet?.address.slice(
                                                      0,
                                                      10
                                                  )}...${user?.wallet?.address.slice(-10)}`}
                                        </p>
                                        <p className="text-sm text-muted-foreground text-left">
                                            {isPortfolioFocused(lastFocus)
                                                ? managedWallet?.address
                                                : `${managedWallet?.address.slice(
                                                      0,
                                                      10
                                                  )}...${managedWallet?.address.slice(-10)}`}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-2 w-full">
                                {/* <h1 className="text-center text-lg font-bold font-bricolage">Chain</h1> */}
                                <div className="flex flex-row items-center gap-2 w-full">
                                    <div className="w-full">
                                        <Select
                                            value={selectedChain}
                                            onValueChange={setSelectedChain}
                                        >
                                            <SelectTrigger className="frosted-glass bg-background/40 rounded-3xl border-0 transition-colors duration-200 focus:ring-0 focus:outline-none outline-none hover:bg-accent hover:text-accent-foreground">
                                                <SelectValue placeholder="Select chain" />
                                            </SelectTrigger>
                                            <SelectContent
                                                position="popper"
                                                className="w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)] rounded-3xl"
                                            >
                                                {" "}
                                                <SelectItem
                                                    value="eip155:42161"
                                                    className="rounded-3xl"
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <NetworkIcon
                                                            chain={"Arbitrum One"}
                                                            className="w-6 h-6"
                                                        />
                                                        <div>
                                                            <p className="font-medium">Arbitrum</p>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem
                                                    value="eip155:1"
                                                    disabled
                                                    className="rounded-3xl"
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <NetworkIcon
                                                            chain={"Ethereum"}
                                                            className="w-6 h-6"
                                                        />
                                                        <div>
                                                            <p className="font-medium">
                                                                Ethereum (soon)
                                                            </p>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem
                                                    value="eip155:10"
                                                    disabled
                                                    className="rounded-3xl"
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <NetworkIcon
                                                            chain={"OP Mainnet"}
                                                            className="w-6 h-6"
                                                        />
                                                        <div>
                                                            <p className="font-medium">
                                                                Optimism (soon)
                                                            </p>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem
                                                    value="eip155:8453"
                                                    disabled
                                                    className="rounded-3xl"
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <NetworkIcon
                                                            chain={"Base"}
                                                            className="w-6 h-6"
                                                        />
                                                        <div>
                                                            <p className="font-medium">
                                                                Base (soon)
                                                            </p>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {!safeAddress && (
                                        <Button
                                            onClick={handleCreateSafe}
                                            disabled={isCreating}
                                            variant="main"
                                            className="w-full rounded-3xl text-background"
                                        >
                                            {isCreating ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Creating...
                                                </>
                                            ) : (
                                                "Deploy Safe Wallet"
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <HoldingsDashboard
                                isLoading={isLoading}
                                totalValue={totalValue}
                                tokens={balances.filter(token => !isDust(token))}
                                onRefresh={handlePortfolioRefresh}
                            />
                            <TokensTable
                                tokens={balances.filter(token => !isDust(token))}
                                totalValue={balances.reduce(
                                    (acc, token) => acc + Number(token.value),
                                    0
                                )}
                                isLoading={isLoading}
                                isExpanded={isPortfolioFocused(lastFocus)}
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex mx-auto flex-col items-center justify-center h-full w-80 text-base pb-20">
                        <h1 className="flex flex-col justify-center text-center text-pretty">
                            Generating Safe Account requires at least 3 signers, including AI Agent
                        </h1>
                        <h1 className="pt-3 flex flex-col justify-center text-center text-pretty">
                            Please connect additional wallet by going into Account Settings on top
                            left
                        </h1>
                    </div>
                )}
            </div>
            <div className="bottom-fade z-[-5]" />
        </div>
    );
}
