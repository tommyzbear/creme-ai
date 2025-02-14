import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BalanceResponse } from "@/lib/services/stakeKit";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatUnits } from "viem";

interface SafePositionsProps {
  chainId: string;
}

export function SafePositions({ chainId }: SafePositionsProps) {
  const [positions, setPositions] = useState<BalanceResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPositions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/safe/positions?chainId=${chainId}`
        );
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.error);
        
        const flattenedPositions = data.positions.flat();
        setPositions(flattenedPositions);
      } catch (error) {
        console.error("Error fetching positions:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch positions",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPositions();
  }, [chainId, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Safe Positions</CardTitle>
        <CardDescription>
          Your current earning positions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : positions.length > 0 ? (
          <div className="space-y-4">
            {positions.map((position) => (
              <div key={position.groupId} className="flex flex-col space-y-2 p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{position.token.symbol}</span>
                  <div className="flex flex-col items-end">
                    <span>
                      {Number(position.amount).toFixed(8)} {position.token.symbol}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Price per share: {Number(position.pricePerShare).toFixed(4)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Network: {position.token.network}</span>
                  <span>Type: {position.type}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">No positions found</p>
        )}
      </CardContent>
    </Card>
  );
} 