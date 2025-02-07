"use client";

import { ChartPie, Copy, Check, RefreshCcw } from "lucide-react";
import { TokensTable } from "@/components/tokens-table";
import { TransactionsTable } from "@/components/transactions-table";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TokenData, Transfer } from "@/lib/services/alchemy";
import { cn } from "@/lib/utils";
import { usePortfolioStore } from "@/stores/portfolio-store";
import { HoldingsDashboard } from "@/components/holdings-dashboard";

interface PortfolioContainerProps {
    className?: string;
    onFocus?: () => void;
    lastFocus: "chat" | "portfolio" | null;
}

export function PortfolioContainer({ className, onFocus, lastFocus }: PortfolioContainerProps) {
    const {
        userWalletTokens,
        userWalletTransactions,
        managedWalletTokens,
        managedWalletTransactions,
        isLoading,
        fetchPortfolioData,
        selectedWalletAddress,
        setSelectedWalletAddress,
        managedWallet,
        setManagedWallet,
        setUserWallet,
    } = usePortfolioStore();

    const { user } = usePrivy();
    const { ready: walletReady, wallets } = useWallets();
    const { toast } = useToast();
    const [isCopied, setIsCopied] = useState(false);
    const [fetchAttempted, setFetchAttempted] = useState<Record<string, boolean>>({});
    const [transactions, setTransactions] = useState<Transfer[]>([]);
    const [tokens, setTokens] = useState<TokenData[]>([]);
    const [scrollOpacity, setScrollOpacity] = useState(0);
    const portfolioContainerRef = useRef<HTMLDivElement>(null);

    const isPortfolioFocused = (lastFocus: "chat" | "portfolio" | null): boolean => {
        if (lastFocus === null) return true;
        return lastFocus === "portfolio";
    };

    useEffect(() => {
        if (walletReady) {
            setManagedWallet(wallets.find((w) => w.walletClientType === "privy") || null);
        }
        if (user?.wallet?.address) {
            setUserWallet(user.wallet.address);
        }
    }, [wallets, walletReady, setManagedWallet, user?.wallet?.address, setUserWallet]);

    useEffect(() => {
        if (selectedWalletAddress === user?.wallet?.address) {
            setTransactions(userWalletTransactions);
            setTokens(userWalletTokens);
        } else {
            setTransactions(managedWalletTransactions);
            setTokens(managedWalletTokens);
        }
    }, [
        userWalletTransactions,
        userWalletTokens,
        managedWalletTransactions,
        managedWalletTokens,
        selectedWalletAddress,
        user?.wallet?.address,
    ]);

    useEffect(() => {
        if (!user?.wallet?.address || !walletReady) return;

        const isManaged = selectedWalletAddress !== user?.wallet?.address;
        const relevantTokens = isManaged ? managedWalletTokens : userWalletTokens;
        const relevantTransactions = isManaged ? managedWalletTransactions : userWalletTransactions;

        if (
            relevantTokens.length === 0 &&
            relevantTransactions.length === 0 &&
            !fetchAttempted[selectedWalletAddress]
        ) {
            setFetchAttempted((prev) => ({ ...prev, [selectedWalletAddress]: true }));
            fetchPortfolioData(selectedWalletAddress, wallets[0].chainId, isManaged).catch(() => {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to fetch token data",
                });
            });
        }
    }, [
        user?.wallet?.address,
        walletReady,
        wallets,
        fetchPortfolioData,
        selectedWalletAddress,
        managedWalletTokens,
        userWalletTokens,
        managedWalletTransactions,
        userWalletTransactions,
        toast,
        fetchAttempted,
    ]);

    useEffect(() => {
        if (user?.wallet?.address && !selectedWalletAddress) {
            setSelectedWalletAddress(user.wallet.address);
        }
    }, [user?.wallet?.address, setSelectedWalletAddress, selectedWalletAddress]);

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

    const handleBuy = (symbol: string) => {
        console.log("Buy", symbol);
    };

    const handleSell = (symbol: string) => {
        console.log("Sell", symbol);
    };

    const totalValue = tokens.reduce((sum, token) => sum + Number(token.value), 0);

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

    const handleWalletChange = (address: string) => {
        setSelectedWalletAddress(address);
        const isManaged = selectedWalletAddress !== user?.wallet?.address;
        const relevantTokens = isManaged ? managedWalletTokens : userWalletTokens;
        const relevantTransactions = isManaged ? managedWalletTransactions : userWalletTransactions;

        if (
            relevantTokens.length === 0 &&
            relevantTransactions.length === 0 &&
            !fetchAttempted[address]
        ) {
            setFetchAttempted((prev) => ({ ...prev, [address]: true }));
            fetchPortfolioData(address, wallets[0].chainId, isManaged).catch(() => {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to fetch token data",
                });
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

    const handlePortfolioRefresh = async () => {
        await fetchPortfolioData(
            selectedWalletAddress,
            wallets[0].chainId,
            selectedWalletAddress !== user?.wallet?.address
        );
        toast({
            description: "Portfolio data refreshed",
            duration: 2000,
        });
    };

    return (
        <div
            className={cn("max-w-5xl mx-auto h-screen overflow-hidden", className)}
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
                        Portfolio
                    </h1>
                    <div className="flex items-center gap-2 h-6">
                        {isLoading ? (
                            <Skeleton className="h-4 w-28" />
                        ) : (
                            <button
                                className="text-sm text-muted-foreground pl-3 hover:text-primary transition-colors flex items-center gap-1 cursor-pointer pointer-events-auto"
                                onClick={() => copyToClipboard(user?.wallet?.address || "")}
                                title="Copy address to clipboard"
                                disabled={!user?.wallet?.address}
                            >
                                {user?.wallet?.address
                                    ? `${user?.wallet?.address.slice(
                                          0,
                                          6
                                      )}...${user?.wallet?.address.slice(-4)}`
                                    : "Not Connected"}
                                {user?.wallet?.address &&
                                    (isCopied ? (
                                        <Check className="w-3 h-3 text-green-500" />
                                    ) : (
                                        <Copy className="w-3 h-3 text-gray-500 hover:text-gray-700" />
                                    ))}
                            </button>
                        )}
                    </div>
                </header>
                <div className="">
                    <HoldingsDashboard
                        isLoading={isLoading}
                        totalValue={totalValue}
                        tokens={tokens}
                        onRefresh={handlePortfolioRefresh}
                    />
                    <TokensTable
                        tokens={tokens}
                        totalValue={totalValue}
                        onBuy={handleBuy}
                        onSell={handleSell}
                        isLoading={isLoading}
                        isExpanded={isPortfolioFocused(lastFocus)}
                    />
                    <TransactionsTable
                        transactions={transactions}
                        isLoading={isLoading || !walletReady}
                        chainId={walletReady ? wallets[0]?.chainId : ""}
                        isExpanded={isPortfolioFocused(lastFocus)}
                    />
                </div>
            </div>
            <div className="bottom-fade z-[-5]" />
        </div>
    );
}
