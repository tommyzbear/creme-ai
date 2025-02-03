import { z } from 'zod'
import type { ToolFn } from './types'
import { DexScreenerPair, getPairsMatchingQuery } from '../services/dexscreener'

export const dexscreenerToolDefinition = {
    name: 'dexscreener',
    parameters: z.object({
        query: z
            .string()
            .describe(
                `query for dexscreener. Be sure to extract the token name, symbol, address or trading pair from the user's message.`
            ),
    }),
    description: 'get the latest prices for a token or trading pair from dexscreener',
}

// type Args = z.infer<typeof dexscreenerToolDefinition.parameters>

// export const dexscreener: ToolFn<Args, DexScreenerPair> = async ({ toolArgs }) => {
//     const res = await getPairsMatchingQuery(toolArgs.query)

//     // Sort pairs by liquidity (descending) and get the highest one
//     const sortedPairs = res.sort((a, b) => {
//         const liquidityA = Number(a.liquidity?.usd || 0)
//         const liquidityB = Number(b.liquidity?.usd || 0)
//         return liquidityB - liquidityA
//     })

//     return sortedPairs[0] || res
// }

export const dexscreenerTool = {
    name: "getTokenPrice",
    description: "Get the current price and trading information for a token",
    parameters: {
        type: "object",
        properties: {
            token: {
                type: "string",
                description: "The token symbol or name to search for"
            }
        },
        required: ["token"]
    },
    async execute({ token }: { token: string }) {
        const pairs = await getPairsMatchingQuery(token)
        if (pairs.length === 0) {
            return `No pairs found for token ${token}`
        }

        // Get the most relevant pair (usually the first one)
        const pair = pairs[0]

        return {
            token: pair.baseToken.symbol,
            price: pair.priceUsd,
            priceChange24h: pair.priceChange?.h24,
            volume24h: pair.volume?.h24,
            buys24h: pair.txns?.h24.buys,
            sells24h: pair.txns?.h24.sells,
            dex: pair.dexId,
            chain: pair.chainId
        }
    }
}