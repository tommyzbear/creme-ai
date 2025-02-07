import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Transfer } from "@/lib/services/alchemy";
import { getExplorerByChainId } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface TransactionsTableProps {
    transactions: Transfer[];
    isLoading: boolean;
    chainId: string;
    isExpanded: boolean;
}

export function TransactionsTable({
    transactions,
    isLoading,
    chainId,
    isExpanded,
}: TransactionsTableProps) {
    const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

    const formatValue = (value: number | null) => {
        if (value === null) return "0";
        return value.toLocaleString(undefined, { maximumFractionDigits: 6 });
    };

    const SkeletonRow = () => (
        <TableRow className="h-10">
            <TableCell className="whitespace-nowrap pl-4">
                <Skeleton className="h-4 w-24" />
            </TableCell>
            <TableCell
                className={cn(
                    "overflow-hidden transition-[width] duration-200",
                    isExpanded ? "w-[110px]" : "w-0 p-0"
                )}
            >
                <Skeleton className="h-4 w-full" />
            </TableCell>
            <TableCell className="w-full text-right box-border px-4">
                <Skeleton className="h-4 w-24 ml-auto" />
            </TableCell>
        </TableRow>
    );

    return (
        <div className="relative">
            <div className="p-4">
                <h2 className="text-base font-bold">Transactions</h2>
            </div>
            <Table className="w-full table-fixed">
                <TableHeader>
                    <TableRow>
                        <TableHead className="px-4 whitespace-nowrap w-full text-left">
                            Time
                        </TableHead>
                        <TableHead
                            className={cn(
                                "overflow-hidden transition-[width] duration-200",
                                isExpanded ? "w-[110px]" : "w-0 p-0"
                            )}
                        >
                            Txn
                        </TableHead>
                        <TableHead className="whitespace-nowrap w-[250px] text-right px-4">
                            Amount
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        Array.from({ length: 10 }).map((_, index) => (
                            <SkeletonRow key={`skeleton-${index}`} />
                        ))
                    ) : transactions.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                                No transactions found
                            </TableCell>
                        </TableRow>
                    ) : (
                        transactions.map((tx, index) => (
                            <TableRow key={`${tx.hash}-${index}`}>
                                <TableCell className="whitespace-nowrap pl-4">
                                    {formatDistanceToNow(new Date(tx.timestamp), {
                                        addSuffix: true,
                                    })}
                                </TableCell>
                                <TableCell
                                    className={cn(
                                        "overflow-hidden transition-[width] duration-200",
                                        isExpanded ? "w-[110px]" : "w-0 p-0"
                                    )}
                                >
                                    <div className="">
                                        <a
                                            href={`${getExplorerByChainId(chainId)}/tx/${tx.hash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="underline hover:text-blue-500"
                                        >
                                            {formatAddress(tx.hash)}
                                        </a>
                                    </div>
                                </TableCell>
                                <TableCell className="w-full text-right box-border px-4">
                                    {formatValue(tx.value)} {tx.asset}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
            {/* <div className="w-full text-center py-4 text-sm">
                <a href="#" className="hover:underline">
                    Load more transactions
                </a>
            </div> */}
        </div>
    );
}
