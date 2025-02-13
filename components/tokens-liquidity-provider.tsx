import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TokenData } from "@/lib/services/alchemy";

interface TokensLiquidityProviderProps {
    balances: TokenData[]
    safeAddress: string
    selectedChain: string
}

export function TokensLiquidityProvider({ balances, safeAddress, selectedChain }: TokensLiquidityProviderProps) {
    const { toast } = useToast();
    const [isLPing, setIsLPing] = useState(false);
    const [selectedToken, setSelectedToken] = useState<string>("");

    const handleLP = async () => {
        if (!selectedToken || !safeAddress) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Please select a token to lend",
            });
            return;
        }

        setIsLPing(true);
        try {
            const response = await fetch("/api/safe/liquidity-provider", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    chainId: selectedChain,
                    safeAddress,
                    tokenIn: selectedToken,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            setSelectedToken("");
            toast({
                title: "Success",
                description: "Successfully LP-ed tokens",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to LP tokens",
            });
        } finally {
            setIsLPing(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Provide Liquidity</CardTitle>
                <CardDescription>
                    Provide liquidity to a pool
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Select
                    value={selectedToken}
                    onValueChange={setSelectedToken}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select token to provide liquidity" />
                    </SelectTrigger>
                    <SelectContent>
                        {balances.map((token) => (
                            <SelectItem key={token.symbol} value={token.contractAddress}>
                                {token.symbol} ({token.balance} available)
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button
                    onClick={handleLP}
                    disabled={isLPing || !selectedToken}
                    className="w-full"
                >
                    {isLPing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            LPing...
                        </>
                    ) : (
                        "Provide Liquidity"
                    )}
                </Button>
            </CardContent>
        </Card>
    );
} 