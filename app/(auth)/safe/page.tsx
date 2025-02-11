"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { formatEther, parseEther } from "viem";

export default function SafePage() {
    const { user } = usePrivy();
    const { wallets } = useWallets();
    const { toast } = useToast();
    const [isCreating, setIsCreating] = useState(false);
    const [isWrapping, setIsWrapping] = useState(false);
    const [selectedChain, setSelectedChain] = useState("eip155:1");
    const [safeAddress, setSafeAddress] = useState("");
    const [ethAmount, setEthAmount] = useState("");

    const managedWallet = wallets.find(w => w.walletClientType === "privy");

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
                    chainId: selectedChain,
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
        <div className="container max-w-4xl py-8 space-y-8">
            <h1 className="text-3xl font-bold">Safe Management</h1>

            <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Create Safe</CardTitle>
                        <CardDescription>
                            Create a new Safe wallet with multiple owners
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateSafe} className="space-y-4">
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
                                        <SelectItem value="eip155:1">Ethereum</SelectItem>
                                        <SelectItem value="eip155:10">Optimism</SelectItem>
                                        <SelectItem value="eip155:42161">Arbitrum</SelectItem>
                                        <SelectItem value="eip155:8453">Base</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button type="submit" disabled={isCreating} className="w-full">
                                {isCreating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create Safe"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

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
            </div>

            {safeAddress && (
                <Card>
                    <CardHeader>
                        <CardTitle>Safe Details</CardTitle>
                        <CardDescription>
                            Your newly created Safe wallet details
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
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
                                    <p className="font-mono text-sm">{user?.wallet?.address}</p>
                                    <p className="font-mono text-sm">{managedWallet?.address}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
} 