import { CMCCategoryResponse, CMCCoin } from "@/types/cmc_types";

const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;

if (!COINMARKETCAP_API_KEY) {
    throw new Error('COINMARKETCAP_API_KEY is not set');
}

const ARBITRUM_CATEGORY_ID = "6171122402ece807e8a9d3ed";

const getByChain = async (chainId: string, filter: (coin: CMCCoin) => boolean = () => true) => {
    let id = "1";

    switch (chainId) {
        case "1":
            id = "1";
            break;
        case "137":
            id = "2";
            break;
        case "42161":
            id = ARBITRUM_CATEGORY_ID;
            break;
        case "8453":
            id = "4";
            break;
        default:
            throw new Error(`Unsupported chainId: ${chainId}`);
    }

    const response = await fetch(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/category?id=${id}`, {
        headers: {
            'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch category ${chainId}: ${response.statusText}`);
    }

    const result = await response.json() as CMCCategoryResponse;

    return result.data.coins.filter(filter);
}

export const cmcService = {
    getByChain
}