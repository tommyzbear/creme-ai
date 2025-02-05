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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { usePortfolioStore } from "@/store/portfolio-store";

interface PortfolioDashboardProps {
    className?: string;
    onFocus?: () => void;
}

export function PortfolioDashboard({ className, onFocus }: PortfolioDashboardProps) {
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
    const containerRef = useRef<HTMLDivElement>(null);

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

    return (
        <div
            className={cn("max-w-5xl mx-auto h-screen overflow-hidden", className)}
            onFocus={onFocus}
            tabIndex={0}
        >
            <div className="relative w-full mx-auto h-full overflow-y-auto test" ref={containerRef}>
                <header
                    className={`
                sticky top-0 z-10 antialiased frosted-glass h-15
                flex flex-col w-full justify-center items-center gap-0 py-2 
                shadow-b-sm
                bg-gradient-to-b main-gradient
                backdrop-blur-sm backdrop-brightness-110
            `}
                >
                    <h1
                        className="text-lg font-bold font-bricolage relative cursor-pointer pointer-events-auto"
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log("Header clicked!");
                            if (containerRef.current) {
                                containerRef.current.scrollTo({
                                    top: 0,
                                    behavior: "smooth",
                                });
                            }
                        }}
                    >
                        Portfolio
                    </h1>
                    <div className="flex items-center gap-2">
                        {isLoading ? (
                            <Skeleton className="h-4 w-28" />
                        ) : (
                            <>
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
                                <RefreshCcw
                                    className="w-4 h-4 cursor-pointer hover:text-gray-700"
                                    onClick={async () => {
                                        await fetchPortfolioData(
                                            selectedWalletAddress,
                                            wallets[0].chainId,
                                            selectedWalletAddress !== user?.wallet?.address
                                        );
                                        toast({
                                            description: "Portfolio data refreshed",
                                            duration: 2000,
                                        });
                                    }}
                                />
                            </>
                        )}
                    </div>
                </header>
                <div className="flex items-center gap-2">
                    <Select value={selectedWalletAddress} onValueChange={handleWalletChange}>
                        <SelectTrigger className="w-[280px]">
                            <SelectValue placeholder="Select wallet" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={user?.wallet?.address || "user-wallet"}>
                                User Connected Wallet
                            </SelectItem>
                            {managedWallet && (
                                <SelectItem value={managedWallet?.address || "managed-wallet"}>
                                    Creme Managed Wallet
                                </SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>
                <div className="mt-4">
                    <div className="flex items-center justify-between p-4 border-b">
                        <h2 className="font-semibold">Tokens</h2>
                        {isLoading ? (
                            <Skeleton className="h-6 w-24" />
                        ) : (
                            <span className="font-mono">${totalValue.toFixed(2)}</span>
                        )}
                    </div>
                    <TokensTable
                        tokens={tokens}
                        onBuy={handleBuy}
                        onSell={handleSell}
                        isLoading={isLoading}
                    />

                    <div className="p-4">
                        <h2 className="text-base font-bold">Transactions</h2>
                    </div>
                    <TransactionsTable
                        transactions={transactions}
                        isLoading={isLoading || !walletReady}
                        chainId={walletReady ? wallets[0]?.chainId : ""}
                    />
                </div>
            </div>
        </div>
    );
}
