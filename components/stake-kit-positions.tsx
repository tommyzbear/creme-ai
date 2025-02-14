import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BalanceResponse } from "@/lib/services/stakeKit";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface StakeKitPositionsProps {
  chainId: string;
}

export function StakeKitPositions({ chainId }: StakeKitPositionsProps) {
  const [positions, setPositions] = useState<BalanceResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [exitingPositions, setExitingPositions] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    const fetchPositions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/safe/positions?chainId=${chainId}`
        );
        const data = await response.json();
        console.log("Fetched positions data:", data);

        if (!response.ok) throw new Error(data.error);

        // Ensure each position has integrationId
        const flattenedPositions = data.positions.flat();
        console.log("Processed positions:", flattenedPositions);
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

  const handleExit = async (position: BalanceResponse) => {
    if (!position.integrationId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Missing integration ID for position",
      });
      return;
    }

    try {
      setExitingPositions(prev => new Set(prev).add(position.groupId));

      const response = await fetch('/api/safe/exit-position', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          positionId: position.integrationId, // Use integrationId instead of groupId
          amount: position.amount,
          chainId
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      toast({
        title: "Success",
        description: "Exit request created successfully",
      });

      // Refresh positions after successful exit
      const updatedResponse = await fetch(`/api/safe/positions?chainId=${chainId}`);
      const updatedData = await updatedResponse.json();
      const updatedPositions = updatedData.positions.flat();
      setPositions(updatedPositions);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to exit position",
      });
    } finally {
      setExitingPositions(prev => {
        const next = new Set(prev);
        next.delete(position.groupId);
        return next;
      });
    }
  };

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
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <span>
                        {Number(position.amount).toFixed(8)} {position.token.symbol}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Price per share: {Number(position.pricePerShare).toFixed(4)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ID: {position.integrationId}
                      </span>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={exitingPositions.has(position.groupId)}
                      onClick={() => handleExit(position)}
                    >
                      {exitingPositions.has(position.groupId) ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Exit'
                      )}
                    </Button>
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