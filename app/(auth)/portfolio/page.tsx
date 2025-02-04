"use client";

import { ChartPie, Copy, Check } from "lucide-react";
import { TokensTable } from "@/components/tokens-table";
import { TransactionsTable } from "@/components/transactions-table";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getAlchemyChainByChainId } from "@/lib/utils";

interface TokenData {
    symbol: string;
    balance: string;
    price: string;
    value: string;
    contractAddress: string;
    logo: string;
}

export default function PortfolioPage() {
    const { user } = usePrivy();
    const { ready: walletReady, wallets } = useWallets();
    const { toast } = useToast();
    const [isCopied, setIsCopied] = useState(false);
    const [tokens, setTokens] = useState<TokenData[]>([]);
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchTokens() {
            if (!user?.wallet?.address || !walletReady) return;

            const chain = getAlchemyChainByChainId(wallets[0].chainId);
            try {
                setIsLoading(true);
                const response = await fetch(
                    `/api/portfolio?address=${user.wallet.address}&chain=${chain}`
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
    }, [user?.wallet?.address, walletReady, toast, wallets]);

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
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ChartPie className="h-8 w-8" />
                    <h1 className="text-xl font-semibold">Portfolio</h1>
                    <div className="flex items-center gap-2">
                        {isLoading ? (
                            <Skeleton className="h-6 w-32" />
                        ) : (
                            <>
                                <span className="text-md text-muted-foreground">
                                    {user?.wallet?.address
                                        ? `${user?.wallet?.address.slice(
                                              0,
                                              6
                                          )}...${user?.wallet?.address.slice(-4)}`
                                        : "Not Connected"}
                                </span>
                                {user?.wallet?.address &&
                                    (isCopied ? (
                                        <Check className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <Copy
                                            className="w-4 h-4 cursor-pointer text-gray-500 hover:text-gray-700"
                                            onClick={() =>
                                                copyToClipboard(user?.wallet?.address || "")
                                            }
                                        />
                                    ))}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="rounded-lg border bg-card">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="font-semibold">Tokens</h2>
                    {isLoading ? (
                        <Skeleton className="h-6 w-24" />
                    ) : (
                        <span className="font-mono">${totalValue.toFixed(2)}</span>
                    )}
                </div>
                <div className="p-4">
                    <TokensTable
                        tokens={tokens}
                        onBuy={handleBuy}
                        onSell={handleSell}
                        isLoading={isLoading}
                    />
                </div>
            </div>

            <div className="rounded-lg border bg-card">
                <div className="p-4 border-b">
                    <h2 className="font-semibold">Transactions</h2>
                </div>
                <div className="p-4">
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
