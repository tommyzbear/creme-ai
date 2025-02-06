import { z } from 'zod';
import { cookies } from 'next/headers';
import { privyClient } from '../privy';
import { supabase } from '../supabase';

export const getPortfolio = {
    description: 'Get the portfolio from the portfolio table',
    parameters: z.object({
        portfolioId: z.string().describe('The id of the portfolio to get').optional(),
        draft_only: z.boolean().describe('Whether to get the draft portfolio only').optional(),
        active_only: z.boolean().describe('Whether to get the active portfolio only').optional()
    }),
    execute: async ({ portfolioId, draft_only, active_only }: { portfolioId: string, draft_only: boolean, active_only: boolean }) => {
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

            if (portfolioId && draft_only) {
                const { data: portfolio, error: portfolioError } = await supabase
                    .from('draft_portfolio')
                    .select('*')
                    .eq('id', portfolioId)
                    .eq('user_id', claims.userId)
                    .single();

                if (portfolioError) {
                    return {
                        error: 'Failed to fetch draft portfolio',
                        message: portfolioError.message
                    }
                }

                return {
                    message: 'Draft portfolio fetched successfully, would you like to promote it?',
                    data: portfolio
                }
            }

            if (portfolioId && active_only) {
                const { data: portfolio, error: portfolioError } = await supabase
                    .from('portfolio')
                    .select('*')
                    .eq('id', portfolioId)
                    .eq('user_id', claims.userId)
                    .eq('active', true)
                    .single();

                if (portfolioError) {
                    return {
                        error: 'Failed to fetch active portfolio',
                        message: portfolioError.message
                    }
                }

                return {
                    message: 'Active portfolio fetched successfully, would you like to adjust it or disable it?',
                    data: portfolio
                }
            }

            if (draft_only) {
                const { data: draftPortfolios, error: draftPortfolioError } = await supabase
                    .from('draft_portfolio')
                    .select('*')
                    .eq('user_id', claims.userId)
                    .eq('applied', false);

                if (draftPortfolioError) {
                    return {
                        error: 'Failed to fetch draft portfolio',
                        message: draftPortfolioError.message
                    }
                }

                if (draftPortfolios.length === 0) {
                    return {
                        error: 'No draft portfolio found',
                        message: 'Would you like to create a draft portfolio?'
                    }
                }

                return {
                    message: 'Draft portfolio fetched successfully, would you like to promote any of them?',
                    data: draftPortfolios
                }
            }

            if (active_only) {
                const { data: activePortfolios, error: activePortfolioError } = await supabase
                    .from('portfolio')
                    .select('*')
                    .eq('user_id', claims.userId)
                    .eq('active', true);

                if (activePortfolioError) {
                    return {
                        error: 'Failed to fetch active portfolio',
                        message: activePortfolioError.message
                    }
                }

                if (activePortfolios.length === 0) {
                    return {
                        error: 'No active portfolio found',
                        message: 'Would you like to create a portfolio or promote a draft portfolio?'
                    }
                }
                return {
                    message: 'Active portfolio fetched successfully, would you like to adjust any of them or disable them?',
                    data: activePortfolios
                }
            }

            const { data: draftPortfolio, error: draftPortfolioError } = await supabase
                .from('draft_portfolio')
                .select('*')
                .eq('user_id', claims.userId);

            if (draftPortfolioError) {
                return {
                    error: 'Failed to fetch draft portfolio',
                    message: draftPortfolioError.message
                }
            }

            const { data: savedPortfolio, error: savedPortfolioError } = await supabase
                .from('portfolio')
                .select('*')
                .eq('user_id', claims.userId)

            if (savedPortfolioError) {
                return {
                    error: 'Failed to fetch portfolio',
                    message: savedPortfolioError.message
                }
            }

            if (savedPortfolio.length === 0 && draftPortfolio.length === 0) {
                return {
                    error: 'No portfolios found',
                    message: 'Would you like to create a portfolio?'
                }
            }

            return {
                message: 'Portfolio fetched successfully, would you like to adjust any of them or disable them?',
                savedPortfolio: savedPortfolio,
                draftPortfolio: draftPortfolio
            };
        } catch (error) {
            console.error('Portfolio creation error:', error);
            return {
                error: 'Failed to save portfolio',
                message: 'Failed to save portfolio'
            };
        }
    }
};
