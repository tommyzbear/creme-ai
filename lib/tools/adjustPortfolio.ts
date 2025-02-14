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
    description: 'When user want to adjust their portfolio, you can use this tool to adjust the portfolio base on the token and weight that the user has proposed',
    parameters: z.object({
        portfolioId: z.number().describe('The id of the portfolio to adjust'),
        tokenAdjustment: z.object({
            token: z.string().describe('The token to adjust the portfolio for'),
            weight: z.number().describe('The weight of the token in the portfolio'),
        }).array().describe('User could propose change base on chain type or multiple tokens, please be sure to include all the tokens that the user want to adjust'),
    }),
    execute: async (
        { portfolioId, tokenAdjustment }: { portfolioId: number, tokenAdjustment: { token: string, weight: number }[] }) => {
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
                .select('*')
                .eq('id', portfolioId)
                .single();

            if (draftPortfolioError) {
                return {
                    error: 'Failed to get draft portfolio',
                    message: draftPortfolioError.message
                }
            }

            if (!draftPortfolio.portfolio.find((p: AllocationEntry) => tokenAdjustment.find((t: { token: string, weight: number }) => t.token === p.token))) {
                return {
                    error: 'Token not found in portfolio',
                    message: 'Token not found in portfolio'
                }
            }

            if (tokenAdjustment.find((t: { token: string, weight: number }) => t.weight < 0)) {
                return {
                    error: 'Weight is too low, minimum weight is 0',
                }
            }

            let updatedPortfolio: AllocationEntry[] = draftPortfolio.portfolio;

            console.log("tokenAdjustment", tokenAdjustment);

            // First remove all the tokens that are being set to zero weighting
            if (tokenAdjustment.find((t: { token: string, weight: number }) => t.weight === undefined || t.weight === 0)) {
                tokenAdjustment.forEach(async (t: { token: string, weight: number }) => {
                    if (t.weight === undefined || t.weight === 0) {
                        updatedPortfolio = updatedPortfolio.filter(
                            (p: AllocationEntry) => p.token !== t.token
                        );
                    }
                })
                updatedPortfolio = rebalancePortfolio(updatedPortfolio);

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
                    message: 'Portfolio adjusted',
                    portfolio: updatedPortfolio
                }
            }

            // Then update the weights of the tokens that are not being set to zero
            tokenAdjustment.forEach(async (t: { token: string, weight: number }) => {
                // Update the weight of the specified token
                updatedPortfolio = updatedPortfolio.map((p: AllocationEntry) =>
                    p.token === t.token ? { ...p, weight: t.weight } : p
                );
                updatedPortfolio = rebalancePortfolio(updatedPortfolio, { token: t.token, weight: t.weight });
            })

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
                message: 'Portfolio adjusted',
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
