import { isLegitToken } from "@/lib/utils";
import { addScamToken, isScamToken } from '@/lib/services/scam-token';
import { Alchemy, AssetTransfersCategory, AssetTransfersWithMetadataResult, Network, SortingOrder } from "alchemy-sdk";

const config = {
    apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(config);

const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY

interface TokenBalance {
    contractAddress: string
    tokenBalance: string
}

interface TokenMetadata {
    name: string
    symbol: string
    decimals: number
    logo?: string
}

interface TokenPrice {
    network: string
    address: string
    prices: [
        { currency: string, value: number, lastUpdated: string }
    ]
    error?: {
        message: string
    }
}

interface Transfer {
    hash: string
    from: string
    to: string | null
    value: number | null
    asset: string
    category: string
    timestamp: string
}

export async function getWalletTokens(address: string, chain: string): Promise<{
    contractAddress: string
    tokenName: string
    symbol: string
    divisor: number
    balance: string
    type: string
    logo: string
}[]> {
    try {
        // Get token balances
        const balancesResponse = await fetch(
            `https://${chain}.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: 1,
                    jsonrpc: "2.0",
                    method: "alchemy_getTokenBalances",
                    params: [address]
                })
            }
        )

        const balancesData = await balancesResponse.json()
        // Filter out zero balances
        const nonZeroBalances = balancesData.result.tokenBalances.filter(
            (token: TokenBalance) => token.tokenBalance !== '0x0000000000000000000000000000000000000000000000000000000000000000'
        )

        // Get token metadata for non-zero balances
        const tokens = await Promise.all(
            nonZeroBalances.map(async (token: TokenBalance) => {
                // Check if token is already marked as scam
                if (await isScamToken(token.contractAddress, chain)) {
                    return null
                }
                const metadataResponse = await fetch(
                    `https://${chain}.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id: 1,
                            jsonrpc: "2.0",
                            method: "alchemy_getTokenMetadata",
                            params: [token.contractAddress]
                        })
                    }
                )
                const metadata: { result: TokenMetadata } = await metadataResponse.json()

                if (!metadata.result) {
                    // Mark as scam token if metadata is not available
                    await addScamToken(token.contractAddress, chain)
                    return null
                }

                return {
                    contractAddress: token.contractAddress,
                    tokenName: metadata.result.name,
                    symbol: metadata.result.symbol,
                    divisor: Math.pow(10, metadata.result.decimals),
                    balance: token.tokenBalance,
                    logo: metadata.result.logo,
                    type: 'ERC20'
                }
            })
        )

        return tokens.filter((token) => token !== null)
    } catch (error) {
        console.error('Error fetching tokens:', error)
        return []
    }
}

export async function getTokenPrices(contractAddresses: string[], chain: string): Promise<{ address: string, price: number }[]> {
    try {
        // Batch addresses into groups of 25
        const batchSize = 25;
        const batches = [];
        for (let i = 0; i < contractAddresses.length; i += batchSize) {
            batches.push(contractAddresses.slice(i, i + batchSize));
        }

        // Process each batch
        const allResults = await Promise.all(
            batches.map(async (batchAddresses) => {
                const options = {
                    method: 'POST',
                    headers: { accept: 'application/json', 'content-type': 'application/json' },
                    body: JSON.stringify({
                        addresses: batchAddresses.map(address => ({ network: chain, address }))
                    })
                };
                const response = await fetch(`https://api.g.alchemy.com/prices/v1/${ALCHEMY_API_KEY}/tokens/by-address`, options);
                const result = await response.json();
                return result.data || [];
            })
        );

        // Flatten results from all batches
        const result = { data: allResults.flat() };

        if (!result.data || result.data.length === 0) {
            return [];
        }

        result.data.filter((token: TokenPrice) => token.error).forEach(async (token: TokenPrice) => {
            await addScamToken(token.address, chain);
        });

        const nonErrorTokens = result.data.filter((token: TokenPrice) => !token.error);
        const tokens = await Promise.all(nonErrorTokens.filter(async (token: TokenPrice) => isLegitToken(token.address, chain)));

        return tokens.map((token: TokenPrice) => ({
            address: token.address,
            price: token.prices[0].value
        }));
    } catch (error) {
        console.error('Error fetching token prices:', error);
        return [];
    }
}

export async function getRecentTransfers(address: string, chain: string): Promise<Transfer[]> {
    try {
        const response = await fetch(
            `https://${chain}.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: 1,
                    jsonrpc: "2.0",
                    method: "alchemy_getAssetTransfers",
                    params: [{
                        fromAddress: address,
                        category: ["erc20"],
                        withMetadata: true,
                        maxCount: "0x14",
                        order: "desc"
                    }]
                })
            }
        );
        const data = await response.json();

        return data.result.transfers.map((transfer: any) => ({
            hash: transfer.hash,
            from: transfer.from,
            to: transfer.to,
            value: transfer.value,
            asset: transfer.asset || 'ETH',
            category: transfer.category,
            timestamp: transfer.metadata.blockTimestamp
        }));
    } catch (error) {
        console.error('Error fetching transfers:', error);
        return [];
    }
}

