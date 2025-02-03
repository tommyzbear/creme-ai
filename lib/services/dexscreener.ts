/**
 * Check if the token has a valid trading volume on Dex Screener
 */
interface Website {
    label?: string;
    url: string;
}

interface Social {
    type: string;
    url: string;
}

interface Token {
    address: string | null;
    name: string | null;
    symbol: string | null;
}

interface Liquidity {
    usd: number;
    base: number;
    quote: number;
}

interface TransactionData {
    buys: number;
    sells: number;
}

interface Transactions {
    m5: TransactionData;
    h1: TransactionData;
    h6: TransactionData;
    h24: TransactionData;
}

interface Volume {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
}

interface PriceChange {
    h1: number;
    h6: number;
    h24: number;
}

interface PairInfo {
    imageUrl?: string;
    header?: string;
    openGraph?: string;
    websites?: Website[];
    socials?: Social[];
}

interface Boosts {
    active: number;
}

export interface DexScreenerPair {
    chainId: string;
    dexId: string;
    url: string;
    pairAddress: string;
    labels?: string[];
    baseToken: Token;
    quoteToken: Token;
    priceNative: string;
    priceUsd?: string;
    txns?: Transactions;
    volume?: Volume;
    priceChange?: PriceChange;
    liquidity?: Liquidity;
    fdv?: number;
    marketCap?: number;
    pairCreatedAt?: number;
    info: PairInfo;
    boosts?: Boosts;
}

interface DexScreenerResponse {
    schemaVersion: string;
    pairs: DexScreenerPair[];
}

export async function hasValidTradingVolume(contractAddress: string): Promise<boolean> {
    try {
        const url = `https://api.dexscreener.com/latest/dex/tokens/${contractAddress}`;
        const response = await fetch(url);
        const data = await response.json();
        const volumeUsd = data.pairs?.[0]?.volumeUsd || 0;
        return volumeUsd >= 1000; // Consider it valid if volume is over $1000 in 24h
    } catch (error) {
        console.error("Dex Screener error:", error);
        return false;
    }
}

export async function getPairsMatchingQuery(query: string): Promise<DexScreenerPair[]> {
    const url = `https://api.dexscreener.com/latest/dex/search?q=${query}`;
    const response = await fetch(url);
    const data = await response.json() as DexScreenerResponse;

    return data.pairs;
}

