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

export const rebalancePortfolioTool = {
    description: 'When user want to rebalance their portfolio, you can use this tool to rebalance the portfolio',
    parameters: z.object({
        portfolioId: z.number().describe('The id of the portfolio to adjust')
    }),
    execute: async (
        { portfolioId }: { portfolioId: number }) => {
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

            const updatedPortfolio = rebalancePortfolio(draftPortfolio.portfolio);

            // Update the draft portfolio
            const { error: updateError } = await supabase
                .from('draft_portfolio')
                .update({ portfolio: updatedPortfolio })
                .eq('id', portfolioId);

            if (updateError) {
                return {
                    error: 'Failed to update portfolio',
                    message: updateError.message
                }
            }

            return {
                message: 'Portfolio rebalanced',
                portfolio: updatedPortfolio
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
