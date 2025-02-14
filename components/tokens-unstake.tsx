import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TokenData } from "@/lib/services/alchemy";

interface TokensUnstakeProps {
    balances: TokenData[]
    safeAddress: string
    selectedChain: string
}

export function TokensUnstake({ balances, safeAddress, selectedChain }: TokensUnstakeProps) {
    const { toast } = useToast();
    const [isUnstaking, setIsUnstaking] = useState(false);
    const [selectedToken, setSelectedToken] = useState<string>("");

    const handleUnstake = async () => {
        if (!selectedToken || !safeAddress) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Please select a token to unstake",
            });
            return;
        }

        setIsUnstaking(true);
        try {
            const response = await fetch("/api/safe/unstake", {
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
                description: "Successfully unstaked tokens",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to unstake tokens",
            });
        } finally {
            setIsUnstaking(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Unstake Tokens</CardTitle>
                <CardDescription>
                    Unstake your tokens
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Select
                    value={selectedToken}
                    onValueChange={setSelectedToken}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select token to unstake" />
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
                    onClick={handleUnstake}
                    disabled={isUnstaking || !selectedToken}
                    className="w-full"
                >
                    {isUnstaking ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Unstaking...
                        </>
                    ) : (
                        "Unstake Tokens"
                    )}
                </Button>
            </CardContent>
        </Card>
    );
} 