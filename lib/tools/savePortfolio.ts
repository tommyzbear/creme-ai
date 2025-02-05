import { z } from 'zod';
import { AgentData, getAgentsPaged } from '../services/cookiedao';
import { AllocationEntry, DraftPortfolio } from '@/types/data';
import { cookies } from 'next/headers';
import { privyClient } from '../privy';
import { supabase } from '../supabase';

interface TokenMetrics {
    mindshareScore: number,
    priceChangeScore: number,
    liquidityScore: number,
    mindSharePercent: number,
    priceChange7d: number,
    liquidity: number,
    riskScore: number,
    token_address: string,
    chainId: number,
    chainType: string
}

interface PortfolioAllocation {
    token: string;
    weight: number;
    mindSharePercent: number;
    priceChange7d: number;
    liquidity: number;
    riskScore: number;
    metrics: TokenMetrics;
}

export const createPortfolio = {
    description: 'Summarize the data from the response and provide a portfolio suggestion with detailed % split of each token',
    parameters: z.object({}),
    execute: async () => {
        try {
            const data = await getAgentsPaged();
            if (!data.ok?.data) {
                throw new Error('No data received from API');
            }

            const cookieStore = await cookies();
            const cookieAuthToken = cookieStore.get("privy-token");

            if (!cookieAuthToken) {
                return {
                    error: 'Unauthorized',
                    message: 'Unauthorized'
                }
            }

            const claims = await privyClient.verifyAuthToken(cookieAuthToken.value);

            if (!claims) {
                return {
                    error: 'Unauthorized',
                    message: 'Unauthorized'
                }
            }

            const tokens = data.ok.data;
            const portfolio = generatePortfolio(tokens);

            const allocationEntries = portfolio.map(p => ({
                token: p.token,
                weight: p.weight,
                token_address: p.metrics.token_address,
                chainId: p.metrics.chainId,
                chainType: p.metrics.chainType
            } as AllocationEntry));

            const { data: draftPortfolio, error: draftPortfolioError } = await supabase
                .from('draft_portfolio')
                .insert({
                    user_id: claims.userId,
                    portfolio: allocationEntries
                })
                .select()
                .single();

            if (draftPortfolioError) {
                console.error('Failed to create draft portfolio:', draftPortfolioError);
                return {
                    error: 'Failed to create draft portfolio',
                    message: draftPortfolioError.message
                }
            }

            return {
                data: {
                    allocations: portfolio,
                    summary: generateSummary(portfolio)
                },
                draftPortfolioId: draftPortfolio.id
            };
        } catch (error) {
            console.error('Portfolio creation error:', error);
            return {
                error,
                message: 'Failed to generate portfolio allocation'
            };
        }
    }
};

const generatePortfolio = (tokens: AgentData[]): PortfolioAllocation[] => {
    // Find maximum values for normalization
    const maxMindshare = Math.max(...tokens.map(t => t.mindshare || 0));
    const maxLiquidity = Math.max(...tokens.map(t => t.liquidity || 0));

    // Calculate normalized scores
    const scores = tokens.map(token => {
        const mindshareScore = token.mindshare / maxMindshare;
        const priceChangeScore = (token.priceDeltaPercent + 50) / 100;
        const liquidityScore = token.liquidity / maxLiquidity;
        const riskScore = calculateRiskScore(token);

        const finalScore = (
            0.4 * mindshareScore +
            0.3 * priceChangeScore +
            0.2 * liquidityScore +
            0.1 * riskScore
        );

        return {
            token: token.agentName,
            score: finalScore,
            metrics: {
                mindshareScore: mindshareScore,
                priceChangeScore: priceChangeScore,
                liquidityScore: liquidityScore,
                riskScore,
                mindSharePercent: token.mindshare / 100,
                priceChange7d: token.priceDeltaPercent,
                liquidity: token.liquidity,
                token_address: token.contracts[0].contractAddress,
                chainId: token.contracts[0].chain,
                chainType: token.contracts[0].chain === -2 ? 'solana' : 'ethereum'
            }
        };
    });

    // Calculate weights
    const totalScore = scores.reduce((sum, token) => sum + token.score, 0);
    const allocations = scores.map(token => ({
        token: token.token,
        weight: Math.min((token.score / totalScore) * 83, 20), // Cap at 20%, reserve 17% for stables
        mindSharePercent: token.metrics.mindSharePercent,
        priceChange7d: token.metrics.priceChange7d,
        liquidity: token.metrics.liquidity,
        riskScore: token.metrics.riskScore,
        metrics: token.metrics
    }));

    // Add "Stables" allocation
    allocations.push({
        token: 'USDC',
        weight: 17,
        mindSharePercent: 0,
        priceChange7d: 0,
        liquidity: 0,
        riskScore: 0,
        metrics: {
            mindshareScore: 0,
            priceChangeScore: 0,
            liquidityScore: 0,
            mindSharePercent: 0,
            priceChange7d: 0,
            liquidity: 0,
            riskScore: 0,
            token_address: '',
            chainId: 0,
            chainType: ''
        }
    });

    return allocations;
}

const calculateRiskScore = (token: AgentData): number => {
    // Volatility Score (40%)
    const volatilityScore = calculateVolatilityScore({
        marketCapDelta: token.marketCapDeltaPercent || 0,
        priceDelta: token.priceDeltaPercent || 0,
        volumeDelta: token.volume24HoursDeltaPercent || 0
    });

    // Liquidity & Stability Score (30%)
    const liquidityScore = calculateLiquidityScore({
        liquidity: token.liquidity || 0,
        holdersDelta: token.holdersCountDeltaPercent || 0
    });

    // Social Sentiment Score (30%)
    const sentimentScore = calculateSentimentScore({
        mindshareDelta: token.mindshareDeltaPercent || 0,
        engagementGrowth: token.averageEngagementsCountDeltaPercent || 0,
        smartFollowers: token.smartFollowersCount || 0
    });

    // Final weighted risk score (0-1 range)
    const riskScore = (
        0.4 * volatilityScore +
        0.3 * liquidityScore +
        0.3 * sentimentScore
    );

    return riskScore;
}

const calculateVolatilityScore = (params: {
    marketCapDelta: number,
    priceDelta: number,
    volumeDelta: number
}): number => {
    // Normalize each metric to 0-1 range and average them
    // Higher values indicate higher risk
    const normalizedMarketCap = Math.min(Math.abs(params.marketCapDelta) / 100, 1);
    const normalizedPrice = Math.min(Math.abs(params.priceDelta) / 100, 1);
    const normalizedVolume = Math.min(Math.abs(params.volumeDelta) / 100, 1);

    return (normalizedMarketCap + normalizedPrice + normalizedVolume) / 3;
}

const calculateLiquidityScore = (params: {
    liquidity: number,
    holdersDelta: number
}): number => {
    // Normalize liquidity (inverse as lower liquidity means higher risk)
    const normalizedLiquidity = Math.max(1 - (params.liquidity / 1000000), 0);
    // Normalize holders delta (negative change increases risk)
    const normalizedHolders = Math.max(-params.holdersDelta / 100, 0);

    return (normalizedLiquidity + normalizedHolders) / 2;
}

const calculateSentimentScore = (params: {
    mindshareDelta: number,
    engagementGrowth: number,
    smartFollowers: number
}): number => {
    // Normalize mindshare delta (sudden spikes increase risk)
    const normalizedMindshare = Math.min(Math.abs(params.mindshareDelta) / 100, 1);
    // Normalize engagement growth (rapid growth increases risk)
    const normalizedEngagement = Math.min(params.engagementGrowth / 100, 1);
    // Normalize smart followers (inverse as more followers decrease risk)
    const normalizedFollowers = Math.max(1 - (params.smartFollowers / 1000), 0);

    return (normalizedMindshare + normalizedEngagement + normalizedFollowers) / 3;
}

const generateSummary = (portfolio: PortfolioAllocation[]): string => {
    const topHoldings = portfolio
        .filter(p => p.token !== 'USDC')
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 3);

    return `Portfolio consists of ${portfolio.length - 1} tokens with top holdings: ${topHoldings.map(t => `${t.token} (${t.weight.toFixed(1)}%)`).join(', ')
        }. 17% reserved for emerging opportunities.`;
}
