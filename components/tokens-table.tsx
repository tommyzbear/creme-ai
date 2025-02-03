import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import Image from "next/image"
import { Copy, Coins, Check } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useState } from "react"

interface Token {
    symbol: string
    balance: string
    price: string
    value: string
    contractAddress: string
    logo: string
}

interface TokensTableProps {
    tokens: Token[]
    onBuy: (symbol: string) => void
    onSell: (symbol: string) => void
    isLoading: boolean
}

export function TokensTable({ tokens, onBuy, onSell, isLoading }: TokensTableProps) {
    const [copiedSymbol, setCopiedSymbol] = useState<string | null>(null)

    const formatCurrency = (value: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 6
        }).format(Number(value))
    }

    const formatNumber = (value: string) => {
        return new Intl.NumberFormat('en-US').format(Number(value))
    }

    const handleCopy = (address: string, symbol: string) => {
        navigator.clipboard.writeText(address)
        setCopiedSymbol(symbol)
        toast({
            description: "Copied to clipboard",
            duration: 2000,
        })

        setTimeout(() => {
            setCopiedSymbol(null)
        }, 1000)
    }

    const renderSkeletonRows = () => {
        return Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={`skeleton-${index}`}>
                <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-gray-200 animate-pulse" />
                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                    </div>
                </TableCell>
                <TableCell className="text-right">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse ml-auto" />
                </TableCell>
                <TableCell className="text-right">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse ml-auto" />
                </TableCell>
                <TableCell className="text-right">
                    <div className="h-4 w-28 bg-gray-200 rounded animate-pulse ml-auto" />
                </TableCell>
                <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                        <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                        <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                    </div>
                </TableCell>
            </TableRow>
        ))
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody className="max-h-[320px] overflow-y-auto">
                {isLoading ? (
                    renderSkeletonRows()
                ) : tokens.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                            No tokens found
                        </TableCell>
                    </TableRow>
                ) : (
                    tokens.map((token) => (
                        <TableRow key={token.symbol}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    {token.logo ? (
                                        <Image
                                            src={token.logo}
                                            alt={token.symbol}
                                            width={24}
                                            height={24}
                                            className="rounded-full"
                                        />
                                    ) : (
                                        <Coins className="h-4 w-4" />
                                    )}
                                    <span>{token.symbol}</span>

                                    {copiedSymbol === token.symbol ? (
                                        <Check className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <Copy
                                            className="h-4 w-4 text-black cursor-pointer hover:text-gray-600"
                                            onClick={() => handleCopy(token.contractAddress, token.symbol)}
                                        />
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="text-right font-mono">
                                {formatNumber(token.balance)}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                                {formatCurrency(token.price)}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                                {formatCurrency(token.value)}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onSell(token.symbol)}
                                    >
                                        Sell
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => onBuy(token.symbol)}
                                    >
                                        Buy
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    )
} 