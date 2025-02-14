import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { parseEther } from "viem";

const DEFI_OPTIONS = [
    { id: "arbitrum-weth-aave-v3-lending", name: "Aave V3 Lending" },
    { id: "arbitrum-weth-fweth-0x45df0656f8adf017590009d2f1898eeca4f0a205-4626-vault", name: "WETH Fluid Lender" },
    { id: "arbitrum-weth-dwethv3-0x04419d3509f13054f60d253e0c79491d9e683399-4626-vault", name: "WETH Main WETH v3 Gearbox Vault" },
];

export function StakeKitDefi() {
    const [isStaking, setIsStaking] = useState(false);
    const [selectedChain, setSelectedChain] = useState("eip155:42161"); // Default to Arbitrum
    const [safeAddress, setSafeAddress] = useState("");
    const [amount, setAmount] = useState("");
    const [selectedDeFi, setSelectedDeFi] = useState(DEFI_OPTIONS[0].id);
    const { toast } = useToast();

    const handleStake = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!safeAddress || !amount || !selectedDeFi) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Please fill in all fields",
            });
            return;
        }

        setIsStaking(true);
        try {
            const inputAmount = amount.toString();
            const response = await fetch("/api/safe/stakekit-defi", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    chainId: selectedChain,
                    inputAmount,
                    DeFiOption: selectedDeFi,
                    safeAddress,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            toast({
                title: "Success",
                description: `Successfully staked ${amount} in ${selectedDeFi}`,
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to stake",
            });
        } finally {
            setIsStaking(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Stake in DeFi</CardTitle>
                <CardDescription>
                    Stake your assets in various DeFi protocols
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleStake} className="space-y-4">
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
                        <Label htmlFor="defiOption">DeFi Protocol</Label>
                        <Select
                            value={selectedDeFi}
                            onValueChange={setSelectedDeFi}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select DeFi protocol" />
                            </SelectTrigger>
                            <SelectContent>
                                {DEFI_OPTIONS.map((option) => (
                                    <SelectItem key={option.id} value={option.id}>
                                        {option.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.000000000000000001"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.0"
                        />
                    </div>

                    <Button type="submit" disabled={isStaking} className="w-full">
                        {isStaking ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Staking...
                            </>
                        ) : (
                            "Stake"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
} 