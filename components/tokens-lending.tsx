import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TokenData } from "@/lib/services/alchemy";

interface TokensLendingProps {
    balances: TokenData[]
    safeAddress: string
    selectedChain: string
}

export function TokensLending({ balances, safeAddress, selectedChain }: TokensLendingProps) {
    const { toast } = useToast();
    const [isLending, setIsLending] = useState(false);
    const [selectedToken, setSelectedToken] = useState<string>("");

    const handleLend = async () => {
        if (!selectedToken || !safeAddress) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Please select a token to lend",
            });
            return;
        }

        setIsLending(true);
        try {
            const response = await fetch("/api/safe/lending", {
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
                description: "Successfully lent tokens",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to lend tokens",
            });
        } finally {
            setIsLending(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Lend Tokens</CardTitle>
                <CardDescription>
                    Lend your tokens to earn interest
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Select
                    value={selectedToken}
                    onValueChange={setSelectedToken}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select token to lend" />
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
                    onClick={handleLend}
                    disabled={isLending || !selectedToken}
                    className="w-full"
                >
                    {isLending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Lending...
                        </>
                    ) : (
                        "Lend Tokens"
                    )}
                </Button>
            </CardContent>
        </Card>
    );
} 