import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import { Copy, Coins, Check, ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface Token {
    symbol: string;
    balance: string;
    price: string;
    value: string;
    contractAddress: string;
    logo: string;
}

interface TokensTableProps {
    tokens: Token[];
    totalValue: number;
    isLoading: boolean;
    isExpanded: boolean;
}

type SortField = "symbol" | "value" | "percentage";

export function TokensTable({ tokens, isLoading, isExpanded }: TokensTableProps) {
    const [copiedSymbol, setCopiedSymbol] = useState<string | null>(null);
    const [showAll, setShowAll] = useState(false);
    const [sortConfig, setSortConfig] = useState<{
        column: SortField | null;
        order: "asc" | "desc" | null;
    }>({ column: "percentage", order: "desc" });

    const formatValue = (value: string) => {
        const numValue = Number(value);
        if (numValue < 0.01) {
            return "< $0.01";
        }

        return Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(numValue);
    };

    const formatCurrency = (value: string) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 6,
        }).format(Number(value));
    };

    const formatNumber = (value: string) => {
        return new Intl.NumberFormat("en-US").format(Number(value));
    };

    const handleCopy = (address: string, symbol: string) => {
        navigator.clipboard.writeText(address);
        setCopiedSymbol(symbol);
        toast({
            description: "Copied to clipboard",
            duration: 2000,
        });

        setTimeout(() => {
            setCopiedSymbol(null);
        }, 1000);
    };

    const renderSkeletonRows = () => {
        return Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={`skeleton-${index}`} className="h-10">
                <TableCell className="p-0 px-4">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                </TableCell>
                <TableCell className="p-0">
                    <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell
                    className={cn(
                        "p-0 text-right transition-all duration-300 overflow-hidden",
                        isExpanded ? "w-[100px] 4xl:w-[200px]" : "4xl:w-[200px] w-0 p-0"
                    )}
                >
                    <Skeleton className="h-4 w-16 ml-auto" />
                </TableCell>
                <TableCell className="text-right">
                    <Skeleton className="h-4 w-20 ml-auto" />
                </TableCell>
                <TableCell className="text-right pr-4">
                    <Skeleton className="h-4 w-12 ml-auto" />
                </TableCell>
            </TableRow>
        ));
    };

    const sortTokens = (tokensToSort: Token[]) => {
        if (!sortConfig.column || !sortConfig.order) return tokensToSort;

        const totalValue = tokens.reduce((sum, t) => sum + Number(t.value), 0);

        return [...tokensToSort].sort((a, b) => {
            let valueA: string | number;
            let valueB: string | number;

            const column = sortConfig.column as keyof Token; // Type assertion since we know column isn't null here

            if (sortConfig.column === "percentage") {
                valueA = (Number(a.value) / totalValue) * 100;
                valueB = (Number(b.value) / totalValue) * 100;
            } else {
                valueA = column === "symbol" ? a[column] : Number(a[column]);
                valueB = column === "symbol" ? b[column] : Number(b[column]);
            }

            if (column === "symbol") {
                return sortConfig.order === "asc"
                    ? (valueA as string).localeCompare(valueB as string)
                    : (valueB as string).localeCompare(valueA as string);
            }

            return sortConfig.order === "asc"
                ? (valueA as number) - (valueB as number)
                : (valueB as number) - (valueA as number);
        });
    };

    const handleSort = (column: SortField) => {
        setSortConfig((current) => ({
            column,
            order: current.column !== column ? "desc" : current.order === "desc" ? "asc" : "desc",
        }));
    };

    const getSortIcon = (column: SortField) =>
        sortConfig.column !== column ? (
            <ChevronsUpDown className="h-3 w-auto inline-block" />
        ) : sortConfig.order === "asc" ? (
            <ChevronUp className="h-3 w-auto inline-block" />
        ) : (
            <ChevronDown className="h-3 w-auto inline-block" />
        );

    const displayedTokens = (() => {
        const sortedTokens = sortTokens(tokens);
        return showAll ? sortedTokens : sortedTokens.slice(0, 5);
    })();

    const baseRowHeight = 2.5; // Height of one row in rem
    const headerHeight = 1.5; // Height of header in rem (24px / 16)

    const getTableHeight = () => {
        const visibleRows = showAll ? tokens.length : 5;
        return `${headerHeight + visibleRows * baseRowHeight}rem`;
    };

    const calculateTokenPercentage = (tokenValue: string) => {
        const totalValue = tokens.reduce((sum, t) => sum + Number(t.value), 0);
        return ((Number(tokenValue) / totalValue) * 100).toFixed(2);
    };

    return (
        <div className="flex flex-col gap-2">
            <div
                className="overflow-hidden transition-all duration-300"
                style={{ height: getTableHeight() }}
            >
                <Table className="w-full table-fixed">
                    <TableHeader>
                        <TableRow className="h-6 hover:bg-transparent">
                            <TableHead
                                className="px-4 whitespace-nowrap w-full cursor-pointer"
                                onClick={() => handleSort("symbol")}
                            >
                                Token {getSortIcon("symbol")}
                            </TableHead>
                            <TableHead className="px-0 whitespace-nowrap w-[100px] text-left">
                                Price
                            </TableHead>
                            <TableHead
                                className={cn(
                                    "text-right px-0",
                                    "transition-all duration-300 overflow-hidden whitespace-nowrap",
                                    isExpanded ? "w-[100px] 4xl:w-[200px]" : "4xl:w-[200px] w-0 p-0"
                                )}
                            >
                                Amount
                            </TableHead>
                            <TableHead
                                className="whitespace-nowrap w-full text-right cursor-pointer"
                                onClick={() => handleSort("value")}
                            >
                                Value {getSortIcon("value")}
                            </TableHead>
                            <TableHead
                                className="w-[75px] whitespace-nowrap text-right px-4 cursor-pointer"
                                onClick={() => handleSort("percentage")}
                            >
                                % {getSortIcon("percentage")}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="relative">
                        {isLoading ? (
                            renderSkeletonRows()
                        ) : tokens.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    No tokens found
                                </TableCell>
                            </TableRow>
                        ) : (
                            displayedTokens.map((token, index) => (
                                <TableRow className="h-10 p-0" key={`${token.symbol}-${index}`}>
                                    <TableCell className="p-0 px-4 font-medium whitespace-nowrap">
                                        <div className="truncate w-full">
                                            <a
                                                className="flex items-center gap-2 cursor-pointer"
                                                onClick={() =>
                                                    handleCopy(token.contractAddress, token.symbol)
                                                }
                                            >
                                                {token.logo ? (
                                                    <Image
                                                        src={token.logo}
                                                        alt={token.symbol}
                                                        width={token.symbol === "ETH" ? 16 : 24}
                                                        height={token.symbol === "ETH" ? 16 : 24}
                                                        className="rounded-full"
                                                    />
                                                ) : (
                                                    <Coins className="h-[24px] w-[24px] inline-block flex-shrink-0" />
                                                )}
                                                <span>{token.symbol}</span>

                                                {copiedSymbol === token.symbol ? (
                                                    <Check className="h-2 w-2 text-green-500" />
                                                ) : (
                                                    <Copy className="flex-none h-2 w-2 text-black cursor-pointer hover:text-gray-600" />
                                                )}
                                            </a>
                                        </div>
                                    </TableCell>
                                    <TableCell className="p-0 text-left">
                                        {formatCurrency(token.price).slice(0, 8)}
                                    </TableCell>
                                    <TableCell
                                        className={cn(
                                            "p-0 text-right transition-all duration-300 overflow-hidden",
                                            isExpanded
                                                ? "w-[100px] 4xl:w-[200px]"
                                                : "4xl:w-[200px] w-0 p-0"
                                        )}
                                    >
                                        {formatNumber(token.balance)}
                                    </TableCell>
                                    <TableCell className="text-right whitespace-nowrap">
                                        {formatValue(token.value)}
                                    </TableCell>
                                    <TableCell className="text-right whitespace-nowrap pr-4">
                                        {calculateTokenPercentage(token.value)}%
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            {tokens.length > 5 && (
                <Button
                    variant="outline"
                    className="w-auto mt-0 mx-auto rounded-xl transition-colour duration-300 px-3"
                    onClick={() => setShowAll(!showAll)}
                >
                    {showAll ? "Show Less" : `Show All (${tokens.length})`}
                </Button>
            )}
        </div>
    );
}
