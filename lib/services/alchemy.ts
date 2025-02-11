import { isLegitToken } from "@/lib/utils";
import { addScamToken, isScamToken } from '@/lib/services/scam-token';
import { formatEther } from "viem";

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

export interface TokenData {
    symbol: string
    balance: string
    price: string
    value: string
    contractAddress: string
    logo: string
}

export interface Transfer {
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
                const metadata = await getTokenMetadata(token.contractAddress, chain);

                if (!metadata) {
                    // Mark as scam token if metadata is not available
                    await addScamToken(token.contractAddress, chain)
                    return null
                }

                return {
                    contractAddress: token.contractAddress,
                    tokenName: metadata.name,
                    symbol: metadata.symbol,
                    divisor: Math.pow(10, metadata.decimals),
                    balance: token.tokenBalance,
                    logo: metadata.logo,
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

export async function getEthBalanceTokenData(address: string, chain: string): Promise<TokenData> {
    const balanceHex = await getETHBalance(address, chain);

    const price = await getPriceBySymbol("ETH");

    const balance = formatEther(BigInt(balanceHex));

    return {
        symbol: "ETH",
        balance: balance,
        price: price.toString(),
        value: (price * Number(balance)).toString(),
        contractAddress: "",
        logo: "/icons/ethereum-eth-logo.svg"
    } as TokenData;
}

export async function getPriceBySymbol(symbol: string): Promise<number> {
    const response = await fetch(
        `https://api.g.alchemy.com/prices/v1/${ALCHEMY_API_KEY}/tokens/by-symbol?symbols=${symbol}`,
        {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        }
    )
    const data = await response.json();
    return data.data[0].prices[0].value;
}

export async function getTokenBalances(address: string, chain: string): Promise<TokenBalance[]> {
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

    return nonZeroBalances;
}

export async function getETHBalance(address: string, chain: string): Promise<string> {
    const response = await fetch(
        `https://${chain}.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: 1,
                jsonrpc: "2.0",
                method: "eth_getBalance",
                params: [address, "latest"]
            })
        }
    )
    const data = await response.json();
    return data.result;
}

export async function getTokenMetadata(contractAddress: string, chain: string): Promise<TokenMetadata> {
    const metadataResponse = await fetch(
        `https://${chain}.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: 1,
                jsonrpc: "2.0",
                method: "alchemy_getTokenMetadata",
                params: [contractAddress]
            })
        }
    )
    const metadata: { result: TokenMetadata } = await metadataResponse.json()
    return metadata.result;
}

export const ALCHEMY_RPC = {
    ARBITRUM_ONE: `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    ETHEREUM_MAINNET: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    OPTIMISM_MAINNET: `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    BASE_MAINNET: `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
}

export const getAlchemyRpcByChainId = (chainId: number) => {
    switch (chainId) {
        case 1:
            return ALCHEMY_RPC.ETHEREUM_MAINNET;
        case 42161:
            return ALCHEMY_RPC.ARBITRUM_ONE;
        case 10:
            return ALCHEMY_RPC.OPTIMISM_MAINNET;
        case 8453:
            return ALCHEMY_RPC.BASE_MAINNET;
        default:
            throw new Error(`Unsupported chainId: ${chainId}`);
    }
}
