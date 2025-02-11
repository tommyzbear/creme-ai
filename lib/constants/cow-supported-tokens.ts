import { ETH_ADDRESS, SupportedChainId } from "@cowprotocol/cow-sdk";

class Token {
    constructor(
        public readonly chainId: SupportedChainId,
        public readonly address: string,
        public readonly decimals: number,
        public readonly symbol: string,
        public readonly name: string
    ) { }
}

export const TOKENS: Record<SupportedChainId, Token[]> = {
    [SupportedChainId.MAINNET]: [
        new Token(SupportedChainId.MAINNET, ETH_ADDRESS, 18, 'ETH', 'Ether'),
        new Token(SupportedChainId.MAINNET, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT', 'Tether USD'),
        new Token(SupportedChainId.MAINNET, '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', 8, 'WBTC', 'Wrapped BTC'),
        new Token(SupportedChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD Coin'),
        new Token(SupportedChainId.MAINNET, '0xDEf1CA1fb7FBcDC777520aa7f396b4E015F497aB', 18, 'COW', 'CoW Protocol Token'),
    ],
    [SupportedChainId.ARBITRUM_ONE]: [
        new Token(SupportedChainId.ARBITRUM_ONE, ETH_ADDRESS, 18, 'ETH', 'Ether'),
        new Token(SupportedChainId.ARBITRUM_ONE, '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', 6, 'USDT', 'Tether USD'),
        new Token(SupportedChainId.ARBITRUM_ONE, '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', 8, 'WBTC', 'Wrapped BTC'),
        new Token(SupportedChainId.ARBITRUM_ONE, '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', 6, 'USDC', 'USD Coin'),
        new Token(
            SupportedChainId.ARBITRUM_ONE,
            '0xcb8b5cd20bdcaea9a010ac1f8d835824f5c87a04',
            18,
            'COW',
            'CoW Protocol Token'
        ),
    ],
    [SupportedChainId.BASE]: [
        new Token(SupportedChainId.BASE, ETH_ADDRESS, 18, 'ETH', 'Ether'),
        new Token(SupportedChainId.BASE, '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2', 6, 'USDT', 'Tether USD'),
        new Token(SupportedChainId.BASE, '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', 6, 'USDC', 'USD Coin'),
        new Token(SupportedChainId.BASE, '0x60a3e35cc302bfa44cb288bc5a4f316fdb1adb42', 6, 'EURC', 'EURC'),
    ],
}