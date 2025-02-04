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
import { Copy, Coins, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

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
    onBuy: (symbol: string) => void;
    onSell: (symbol: string) => void;
    isLoading: boolean;
}

export function TokensTable({ tokens, onBuy, onSell, isLoading }: TokensTableProps) {
    const [copiedSymbol, setCopiedSymbol] = useState<string | null>(null);
    const [showAll, setShowAll] = useState(false);

    const formatValue = (value: string) => {
        const numValue = Number(value);
        if (numValue > 0.01) {
            return "> 0.01";
        }

        return Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 6,
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
            <TableRow key={`skeleton-${index}`}>
                <TableCell className="font-medium pl-4">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-gray-200 animate-pulse" />
                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                    </div>
                </TableCell>
                <TableCell className="text-left">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell className="text-right">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse ml-auto" />
                </TableCell>
                <TableCell className="text-right">
                    <div className="h-4 w-28 bg-gray-200 rounded animate-pulse ml-auto" />
                </TableCell>
            </TableRow>
        ));
    };

    const displayedTokens = showAll ? tokens : tokens.slice(0, 5);

    const getTableHeight = () => {
        const baseRowHeight = 40; // Height of one row in pixels
        const headerHeight = 24; // Height of header in pixels
        const visibleRows = showAll ? tokens.length : 5;
        return `${headerHeight + visibleRows * baseRowHeight}px`;
    };

    return (
        <div className="flex flex-col gap-2">
            <div
                className="overflow-hidden transition-[height_300ms_ease-in-out]"
                style={{ height: getTableHeight() }}
            >
                <Table>
                    <TableHeader>
                        <TableRow className="">
                            <TableHead className="pl-4 w-[150px] whitespace-nowrap">
                                Token
                            </TableHead>
                            <TableHead className="text-left">Price</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right whitespace-nowrap pr-4">
                                Value
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
                                <TableRow key={`${token.symbol}-${index}`}>
                                    <TableCell className="font-medium pl-4 whitespace-nowrap">
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
                                                    width={24}
                                                    height={24}
                                                    className="rounded-full"
                                                />
                                            ) : (
                                                <Coins className="h-5 w-5" />
                                            )}
                                            <span>{token.symbol}</span>

                                            {copiedSymbol === token.symbol ? (
                                                <Check className="h-2 w-2 text-green-500" />
                                            ) : (
                                                <Copy className="h-2 w-2 text-black cursor-pointer hover:text-gray-600" />
                                            )}
                                        </a>
                                    </TableCell>
                                    <TableCell className="text-left">
                                        {formatCurrency(token.price).slice(0, 8)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatNumber(token.balance)}
                                    </TableCell>
                                    <TableCell className="text-right whitespace-nowrap pr-4">
                                        {formatValue(token.value)}
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
                    className="w-auto mt-2 mx-auto rounded-xl"
                    onClick={() => setShowAll(!showAll)}
                >
                    {showAll ? "Show Less" : `Show All (${tokens.length})`}
                </Button>
            )}
        </div>
    );
}
