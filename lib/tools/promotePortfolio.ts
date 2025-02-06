import { z } from 'zod';
import { cookies } from 'next/headers';
import { privyClient } from '../privy';
import { supabase } from '../supabase';

export const promotePortfolio = {
    description: 'Promote or save the draft portfolio to the active portfolio table',
    parameters: z.object({ draftPortfolioId: z.string().describe('The id of the draft portfolio to promote or save') }),
    execute: async ({ draftPortfolioId }: { draftPortfolioId: string }) => {
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
                .eq('id', draftPortfolioId)
                .eq('user_id', claims.userId)
                .single();

            if (draftPortfolioError) {
                return {
                    error: 'Failed to fetch draft portfolio',
                    message: draftPortfolioError.message
                }
            }

            const { data: savedPortfolio, error: savedPortfolioError } = await supabase
                .from('portfolio')
                .insert({
                    user_id: claims.userId,
                    portfolio: draftPortfolio.portfolio,
                    active: true
                })
                .select()
                .single();

            if (savedPortfolioError) {
                return {
                    error: 'Failed to save portfolio',
                    message: savedPortfolioError.message
                }
            }

            const { error: draftPortfolioUpdateError } = await supabase
                .from('draft_portfolio')
                .update({
                    applied: true
                })
                .eq('id', draftPortfolioId);

            if (draftPortfolioUpdateError) {
                return {
                    error: 'Failed to update draft portfolio',
                    message: draftPortfolioUpdateError.message
                }
            }

            return {
                message: 'Portfolio saved successfully',
                savedPortfolioId: savedPortfolio.id
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