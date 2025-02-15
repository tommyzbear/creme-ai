export interface CMCCategoryResponse {
    status: CMCStatus;
    data: CMCCategoryData;
}

export interface CMCStatus {
    timestamp: string;
    error_code: number;
    error_message: null | string;
    elapsed: number;
    credit_count: number;
    notice: null | string;
}

export interface CMCCategoryData {
    id: string;
    name: string;
    title: string;
    description: string;
    num_tokens: number;
    last_updated: string;
    avg_price_change: number;
    market_cap: number;
    market_cap_change: number;
    volume: number;
    volume_change: number;
    coins: CMCCoin[];
}

export interface CMCCoin {
    id: number;
    name: string;
    symbol: string;
    slug: string;
    num_market_pairs: number;
    date_added: string;
    tags: string[];
    max_supply: number | null;
    circulating_supply: number;
    total_supply: number;
    platform: CMCPlatform | null;
    is_active: number;
    infinite_supply: boolean;
    cmc_rank: number;
    is_fiat: number;
    self_reported_circulating_supply: number | null;
    self_reported_market_cap: number | null;
    tvl_ratio: number | null;
    last_updated: string;
    quote: {
        USD: CMCQuote;
    };
}

export interface CMCPlatform {
    id: number;
    name: string;
    symbol: string;
    slug: string;
    token_address: string;
}

export interface CMCQuote {
    price: number;
    volume_24h: number;
    volume_change_24h: number;
    percent_change_1h: number;
    percent_change_24h: number;
    percent_change_7d: number;
    percent_change_30d: number;
    percent_change_60d: number;
    percent_change_90d: number;
    market_cap: number;
    market_cap_dominance: number;
    fully_diluted_market_cap: number;
    tvl: number | null;
    last_updated: string;
}
