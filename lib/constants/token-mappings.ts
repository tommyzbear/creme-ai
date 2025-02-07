export const COINGECKO_ID_MAP: Record<string, string> = {
    'WETH': 'ethereum',
    'USDC': 'usd-coin',
    'USDT': 'tether',
    // Add more mappings as needed
}

export const NATIVE_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000"

export const SUPPORTED_TOKENS_BY_CHAIN = {
    "eip155:1": { // Ethereum
        ETH: {
            tokenAddress: NATIVE_TOKEN_ADDRESS,
            decimals: 18
        },
        USDC: {
            tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            decimals: 6
        }
    },
    "eip155:42161": { // Arbitrum
        ETH: {
            tokenAddress: NATIVE_TOKEN_ADDRESS,
            decimals: 18
        },
        USDC: {
            tokenAddress: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
            decimals: 6
        }
    },
    "eip155:10": { // Optimism
        ETH: {
            tokenAddress: NATIVE_TOKEN_ADDRESS,
            decimals: 18
        },
        USDC: {
            tokenAddress: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
            decimals: 6
        }
    },
    "eip155:8453": { // Base
        ETH: {
            tokenAddress: NATIVE_TOKEN_ADDRESS,
            decimals: 18
        },
        USDC: {
            tokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
            decimals: 6
        }
    }
}