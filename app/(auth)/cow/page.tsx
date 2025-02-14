"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseEther } from "viem";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ETH_ADDRESS } from "@cowprotocol/cow-sdk";

interface TokenAllocation {
    token: string;
    symbol: string;
    percentage: number;
    address: string;
    decimals: number;
}

const SUPPORTED_CHAINS = [
    { id: "eip155:42161", name: "Arbitrum" },
    { id: "eip155:10", name: "Optimism" },
    { id: "eip155:8453", name: "Base" },
    { id: "eip155:1", name: "Ethereum" },
] as const;

const INDEX_CONSTITUENTS: TokenAllocation[] = [
    {
        token: "Bitcoin",
        symbol: "BTC",
        percentage: 45.65,
        address: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
        decimals: 8
    },
    {
        token: "Ethereum",
        symbol: "ETH",
        percentage: 24.29,
        address: ETH_ADDRESS,
        decimals: 18
    },
    {
        token: "Solana",
        symbol: "SOL",
        percentage: 17.69,
        address: "0x2bcC6D6CdBbDC0a4071e48bb3B969b06B3330c07", // Wrapped SOL
        decimals: 9
    },
    {
        token: "Chainlink",
        symbol: "LINK",
        percentage: 12.37,
        address: "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
        decimals: 18
    }
];

export default function CowPage() {
    const [isSwapping, setIsSwapping] = useState(false);
    const [ethAmount, setEthAmount] = useState("");
    const [selectedChain, setSelectedChain] = useState<string>(SUPPORTED_CHAINS[0].id);
    const { toast } = useToast();

    const handleSwap = async () => {
        if (!ethAmount || parseFloat(ethAmount) <= 0) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Please enter a valid ETH amount",
            });
            return;
        }

        setIsSwapping(true);
        try {
            const response = await fetch("/api/cow/swap", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    tokens: INDEX_CONSTITUENTS,
                    ethAmount: parseEther(ethAmount).toString(),
                    chainId: selectedChain
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            toast({
                title: "Success",
                description: "Swap order created successfully",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create swap order",
            });
        } finally {
            setIsSwapping(false);
        }
    };

    return (
        <div className="container max-w-4xl py-8 space-y-8 flex justify-center items-center">
            <div className="flex flex-col items-center justify-center">
                <h1 className="text-3xl font-bold">Crypto Index Fund</h1>

                <Card className="w-[600px] mt-8">
                    <CardHeader>
                        <CardTitle>Fund Constituents</CardTitle>
                        <CardDescription>
                            Current allocation of the crypto index fund
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Token</TableHead>
                                    <TableHead>Symbol</TableHead>
                                    <TableHead className="text-right">Allocation</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {INDEX_CONSTITUENTS.map((constituent) => (
                                    <TableRow key={constituent.symbol}>
                                        <TableCell className="font-medium">
                                            {constituent.token}
                                        </TableCell>
                                        <TableCell>{constituent.symbol}</TableCell>
                                        <TableCell className="text-right">
                                            {constituent.percentage}%
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="chain">Chain</Label>
                                <Select
                                    value={selectedChain}
                                    onValueChange={setSelectedChain}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select chain" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SUPPORTED_CHAINS.map((chain) => (
                                            <SelectItem key={chain.id} value={chain.id}>
                                                {chain.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="ethAmount">ETH Amount to Deploy</Label>
                                <Input
                                    id="ethAmount"
                                    type="number"
                                    step="0.000000000000000001"
                                    value={ethAmount}
                                    onChange={(e) => setEthAmount(e.target.value)}
                                    placeholder="0.0"
                                />
                            </div>

                            <Button
                                onClick={handleSwap}
                                disabled={isSwapping || !ethAmount || parseFloat(ethAmount) <= 0}
                                className="w-full"
                            >
                                {isSwapping ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating Swap Order...
                                    </>
                                ) : (
                                    "Swap to Index"
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 