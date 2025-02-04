import { z } from 'zod';
import { getPairsMatchingQuery } from '@/lib/services/dexscreener';

export const getTokenPrice = {
    description: 'Get the current price and trading information for a token',
    parameters: z.object({
        token: z.string().describe('The token symbol or name to search for')
    }),
    execute: async ({ token }: { token: string }) => {
        try {
            const pairs = await getPairsMatchingQuery(token)

            if (pairs.length === 0) {
                return `No pairs found for token ${token}`;
            }

            // Sort pairs by liquidity (highest first)
            const sortedPairs = pairs.sort((a, b) => {
                const liquidityA = Number(a.liquidity?.usd || 0);
                const liquidityB = Number(b.liquidity?.usd || 0);
                return liquidityB - liquidityA;
            });

            const pair = sortedPairs[0];
            return {
                token: pair.baseToken.symbol,
                price: pair.priceUsd,
                priceChange24hPercentage: pair.priceChange?.h24,
                volume24h: pair.volume?.h24,
                buys24h: pair.txns?.h24?.buys,
                sells24h: pair.txns?.h24?.sells,
                dex: pair.dexId,
                chain: pair.chainId
            };
        } catch (error) {
            console.error('DexScreener API error:', error);
            throw new Error('Failed to fetch token price');
        }
    }
}; 