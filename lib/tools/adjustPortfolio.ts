import { z } from 'zod';
import { privyClient } from '../privy';
import { cookies } from 'next/headers';
import { supabase } from '../supabase';
import { AllocationEntry } from '@/types/data';

const rebalancePortfolio = (portfolio: AllocationEntry[], fixedToken?: { token: string, weight: number }): AllocationEntry[] => {
    if (portfolio.length === 0) return [];

    if (fixedToken) {
        // Get all tokens except the fixed one
        const otherTokens = portfolio.filter(p => p.token !== fixedToken.token);

        // Calculate the current total weight of other tokens
        const currentOtherTotal = otherTokens.reduce((sum, p) => sum + p.weight, 0);

        // Calculate what percentage remains for other tokens (e.g., 100 - 25 = 75)
        const remainingPercentage = 100 - fixedToken.weight;

        // Return combined portfolio with proportionally adjusted weights
        return [
            // Fixed token with its specified weight
            { ...portfolio.find(p => p.token === fixedToken.token)!, weight: fixedToken.weight },
            // Other tokens adjusted proportionally to fill remaining percentage
            ...otherTokens.map(p => ({
                ...p,
                weight: (p.weight / currentOtherTotal) * remainingPercentage
            }))
        ];
    }

    // Original rebalancing logic when no fixed token
    const totalWeight = portfolio.reduce((sum, p) => sum + p.weight, 0);
    return portfolio.map(p => ({
        ...p,
        weight: (p.weight / totalWeight) * 100
    }));
};

export const adjustPortfolio = {
    description: 'When user want to adjust their portfolio, you can use this tool to adjust the portfolio based on the mind share, risk appetite, seven day delta and liquidity that the user has proposed, or make adjustments to existing portfolio. PLease format the message in a table',
    parameters: z.object({
        portfolioId: z.number().describe('The id of the portfolio to adjust'),
        token: z.string().describe('The token to adjust the portfolio for'),
        weight: z.number().describe('The weight of the token in the portfolio'),
    }),
    execute: async (
        { portfolioId, token, weight }: { portfolioId: number, token: string, weight: number }) => {
        try {
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

            const { data: draftPortfolio, error: draftPortfolioError } = await supabase
                .from('draft_portfolio')
                .select('portfolio')
                .eq('id', portfolioId)
                .single();

            if (draftPortfolioError) {
                return {
                    error: 'Failed to get draft portfolio',
                    message: draftPortfolioError.message
                }
            }

            if (!draftPortfolio.portfolio.find((p: AllocationEntry) => p.token === token)) {
                return {
                    error: 'Token not found in portfolio',
                    message: 'Token not found in portfolio'
                }
            }

            if (weight < 0) {
                return {
                    error: 'Weight is too low, minimum weight is 0',
                }
            }

            if (weight === 0 || weight === undefined) {
                // Remove the token from portfolio
                const updatedPortfolio = draftPortfolio.portfolio.filter(
                    (p: AllocationEntry) => p.token !== token
                );

                const rebalancedPortfolio = rebalancePortfolio(updatedPortfolio);

                // Update the draft portfolio
                const { error: updateError } = await supabase
                    .from('draft_portfolio')
                    .update({ portfolio: rebalancedPortfolio })
                    .eq('id', portfolioId);

                if (updateError) {
                    return {
                        error: 'Failed to update portfolio',
                        message: updateError.message
                    }
                }

                return {
                    message: 'Token removed and portfolio rebalanced',
                    portfolio: rebalancedPortfolio
                }
            }
            else {
                // Update the weight of the specified token
                const updatedPortfolio = draftPortfolio.portfolio.map((p: AllocationEntry) =>
                    p.token === token ? { ...p, weight } : p
                );

                const rebalancedPortfolio = rebalancePortfolio(updatedPortfolio, { token, weight });

                // Update the draft portfolio
                const { error: updateError } = await supabase
                    .from('draft_portfolio')
                    .update({ portfolio: rebalancedPortfolio })
                    .eq('id', portfolioId);

                if (updateError) {
                    return {
                        error: 'Failed to update portfolio',
                        message: updateError.message
                    }
                }

                return {
                    message: 'Portfolio updated and rebalanced',
                    portfolio: rebalancedPortfolio
                }
            }

        } catch (error) {
            console.error('Privy API error:', error);
            return {
                error: error,
                message: 'Failed to send token on behalf of user'
            }
        }
    }
};
