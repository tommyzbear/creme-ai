import { z } from 'zod';
import { privyClient } from '../privy';
import { cookies } from 'next/headers';
import { supabase } from '../supabase';
import { AllocationEntry } from '@/types/data';

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

        } catch (error) {
            console.error('Privy API error:', error);
            return {
                error: error,
                message: 'Failed to get quote'
            }
        }
    }
};

