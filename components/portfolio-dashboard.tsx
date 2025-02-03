"use client";

import { ChartPie, Copy, Check } from "lucide-react";
import { TokensTable } from "@/components/tokens-table";
import { TransactionsTable } from "@/components/transactions-table";
import { usePrivy } from "@privy-io/react-auth";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface TokenData {
    symbol: string;
    balance: string;
    price: string;
    value: string;
    contractAddress: string;
    logo: string;
}

export function PortfolioDashboard({ className }: { className?: string }) {
    const { user } = usePrivy();
    const { toast } = useToast();
    const [isCopied, setIsCopied] = useState(false);
    const [tokens, setTokens] = useState<TokenData[]>([]);
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchTokens() {
            if (!user?.wallet?.address) return;

            try {
                setIsLoading(true);
                // const response = await fetch(`/api/portfolio?address=${user.wallet.address}`);
                const response = await fetch(
                    `/api/portfolio?address=0x5dd596c901987a2b28c38a9c1dfbf86fffc15d77`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch portfolio data");
                }
                const data = await response.json();
                setTokens(data.tokens);
                setTransactions(data.transactions);
            } catch (error) {
                console.error("Error fetching token data:", error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to fetch token data",
                });
            } finally {
                setIsLoading(false);
            }
        }

        fetchTokens();
    }, [user?.wallet?.address, toast]);

    const handleBuy = (symbol: string) => {
        // Implement buy logic
        console.log("Buy", symbol);
    };

    const handleSell = (symbol: string) => {
        // Implement sell logic
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

    return (
        <div className={cn("max-w-5xl mx-auto overflow-y-auto", className)}>
            <header
                className={`
                sticky top-0 z-10 antialiased frosted-glass
                flex flex-col w-full justify-center items-center gap-0 py-2 
                select-none shadow-sm
                bg-gradient-to-b from-white via-white/70 to-transparent 
                backdrop-blur-sm backdrop-brightness-110
            `}
            >
                {/* <ChartPie className="h-8 w-8" /> */}
                <h1 className="text-lg font-bold font-bricolage">Portfolio</h1>
                <div className="flex items-center gap-2">
                    {isLoading ? (
                        <Skeleton className="h-6 w-32" />
                    ) : (
                        <>
                            <button
                                className="text-sm text-muted-foreground pl-3 hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
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
                            </button>
                            {user?.wallet?.address &&
                                (isCopied ? (
                                    <Check className="w-3 h-3 text-green-500" />
                                ) : (
                                    <Copy
                                        className="w-3 h-3 cursor-pointer text-gray-500 hover:text-gray-700"
                                        onClick={() => copyToClipboard(user?.wallet?.address || "")}
                                    />
                                ))}
                        </>
                    )}
                </div>
            </header>

            <div className="mt-4">
                {/* <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-base font-bold">Tokens</h2>
                    {isLoading ? (
                        <Skeleton className="h-6 w-24" />
                    ) : (
                        <span className="font-mono">${totalValue.toFixed(2)}</span>
                    )}
                </div> */}
                <TokensTable
                    tokens={tokens}
                    onBuy={handleBuy}
                    onSell={handleSell}
                    isLoading={isLoading}
                />
                <div className="p-4 border-b">
                    <h2 className="text-base font-bold">Transactions</h2>
                </div>
                <div className="p-4">
                    <TransactionsTable transactions={transactions} isLoading={isLoading} />
                </div>
            </div>
        </div>
    );
}
