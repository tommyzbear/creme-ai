import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveTreeMap } from "@nivo/treemap";
import { TokenData } from "@/lib/services/alchemy";
import { RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface HoldingsDashboardProps {
    isLoading: boolean;
    totalValue: number;
    tokens: TokenData[];
    onRefresh: () => void;
}

type TreeMapDatum = {
    name: string;
    value: number;
};

export function HoldingsDashboard({
    isLoading,
    totalValue,
    tokens,
    onRefresh,
}: HoldingsDashboardProps) {
    const treeMapData = {
        name: "holdings",
        children: tokens.map((token) => ({
            name: token.symbol,
            value: Number(token.value),
        })),
    };

    return (
        <div className="space-y-4 p-4 border-b">
            <div className="flex items-left justify-between">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold">Total Worth</h2>
                </div>
                <div className="flex items-center justify-start gap-3 h-6">
                    {isLoading ? (
                        <Skeleton className="h-5 w-24" />
                    ) : (
                        <span className="font-mono text-lg">${totalValue.toFixed(2)}</span>
                    )}
                    <RefreshCcw
                        className={cn(
                            "w-4 h-4 cursor-pointer hover:text-gray-700 pointer-events-auto",
                            isLoading && "animate-spin"
                        )}
                        onClick={onRefresh}
                    />
                </div>
            </div>

            {/* {!isLoading && tokens.length > 0 && (
                <div className="h-[200px] w-full">
                    <ResponsiveTreeMap
                        data={treeMapData}
                        identity="name"
                        value="value"
                        valueFormat=">-$,.2f"
                        margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                        labelSkipSize={12}
                        label={(d) => {
                            const percentage = ((d.value / totalValue) * 100).toFixed(1);
                            return `${d.data.name} (${percentage}%)`;
                        }}
                        colors={{ scheme: "pastel2" }}
                        borderColor={{ theme: "background" }}
                        animate={true}
                        motionConfig="gentle"
                    />
                </div>
            )} */}
        </div>
    );
}
