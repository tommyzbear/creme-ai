import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getExplorerByChainId } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Transaction {
    hash: string;
    from: string;
    to: string;
    value: number;
    asset: string;
    category: string;
    timestamp: number;
}

interface TransactionsTableProps {
    transactions: Transaction[];
    isLoading: boolean;
    chainId: string;
}

export function TransactionsTable({ transactions, isLoading, chainId }: TransactionsTableProps) {
    const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

    const formatValue = (value: number) =>
        value.toLocaleString(undefined, { maximumFractionDigits: 6 });

    const SkeletonRow = () => (
        <TableRow>
            <TableCell>
                <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
            </TableCell>
            <TableCell>
                <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
            </TableCell>
            <TableCell>
                <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
            </TableCell>
            <TableCell>
                <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
            </TableCell>
            <TableCell className="text-right">
                <div className="h-4 w-24 bg-gray-200 animate-pulse rounded ml-auto" />
            </TableCell>
        </TableRow>
    );

    return (
        <div className="relative">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-left whitespace-nowrap pl-4">Time</TableHead>
                        <TableHead>Txn</TableHead>
                        {/* <TableHead>From</TableHead>
                            <TableHead>To</TableHead> */}
                        <TableHead className="text-right pr-4">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading
                        ? Array.from({ length: 10 }).map((_, index) => (
                              <SkeletonRow key={`skeleton-${index}`} />
                          ))
                        : transactions.map((tx, index) => (
                              <TableRow key={`${tx.hash}-${index}`}>
                                  <TableCell className="whitespace-nowrap pl-4">
                                      {formatDistanceToNow(new Date(tx.timestamp), {
                                          addSuffix: true,
                                      })}
                                  </TableCell>
                                  <TableCell className="capitalize">
                                      <a
                                          href={`${getExplorerByChainId(chainId)}/tx/${tx.hash}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="underline hover:text-blue-500"
                                      >
                                          {formatAddress(tx.hash)}
                                      </a>
                                  </TableCell>
                                  {/* <TableCell>{formatAddress(tx.from)}</TableCell>
                                      <TableCell>{formatAddress(tx.to)}</TableCell> */}
                                  <TableCell className="text-right font-mono pr-4 max-w-[200px] truncate">
                                      {formatValue(tx.value)} {tx.asset}
                                  </TableCell>
                              </TableRow>
                          ))}
                </TableBody>
            </Table>
            <div className="w-full text-center py-4 text-sm">
                <a href="#" className="hover:underline">
                    todo: Load transactions from over 30 days ago
                </a>
            </div>
        </div>
    );
}
