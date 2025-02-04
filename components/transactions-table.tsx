import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { getExplorerByChainId } from "@/lib/utils"
import { formatDistanceToNow } from 'date-fns'

interface Transaction {
    hash: string
    from: string
    to: string
    value: number
    asset: string
    category: string
    timestamp: number
}

interface TransactionsTableProps {
    transactions: Transaction[]
    isLoading: boolean
    chainId: string
}

export function TransactionsTable({ transactions, isLoading, chainId }: TransactionsTableProps) {
    const formatAddress = (address: string) =>
        `${address.slice(0, 6)}...${address.slice(-4)}`

    const formatValue = (value: number) =>
        value.toLocaleString(undefined, { maximumFractionDigits: 6 })

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
    )

    return (
        <div className="relative max-h-[400px] overflow-y-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Txn</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead>To</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        Array.from({ length: 10 }).map((_, index) => (
                            <SkeletonRow key={index} />
                        ))
                    ) : (
                        transactions.map((tx) => (
                            <TableRow key={tx.hash}>
                                <TableCell>
                                    {formatDistanceToNow(new Date(tx.timestamp), { addSuffix: true })}
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
                                <TableCell>{formatAddress(tx.from)}</TableCell>
                                <TableCell>{formatAddress(tx.to)}</TableCell>
                                <TableCell className="text-right font-mono">
                                    {formatValue(tx.value)} {tx.asset}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
} 