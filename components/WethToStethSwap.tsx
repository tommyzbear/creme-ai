import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { parseEther } from "viem";

export function WethToStethSwap() {
    const [isSwapping, setIsSwapping] = useState(false);
    const [selectedChain, setSelectedChain] = useState("eip155:42161"); // Default to Arbitrum
    const [safeAddress, setSafeAddress] = useState("");
    const [wethAmount, setWethAmount] = useState("");
    const { toast } = useToast();

    const handleSwap = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!safeAddress || !wethAmount) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Please fill in all fields",
            });
            return;
        }

        setIsSwapping(true);
        try {
            const response = await fetch("/api/safe/enso-weth2stETH", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    chainId: selectedChain,
                    safeAddress,
                    inputAmount: parseEther(wethAmount).toString(),
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            toast({
                title: "Success",
                description: "Swap transaction created successfully",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create swap",
            });
        } finally {
            setIsSwapping(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Swap WETH to stETH</CardTitle>
                <CardDescription>
                    Swap your WETH to stETH using Enso Finance
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSwap} className="space-y-4">
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
                        <Label htmlFor="wethAmount">WETH Amount</Label>
                        <Input
                            id="wethAmount"
                            type="number"
                            step="0.000000000000000001"
                            value={wethAmount}
                            onChange={(e) => setWethAmount(e.target.value)}
                            placeholder="0.0"
                        />
                    </div>

                    <Button type="submit" disabled={isSwapping} className="w-full">
                        {isSwapping ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Swapping...
                            </>
                        ) : (
                            "Swap WETH to stETH"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
} 