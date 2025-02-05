import { z } from 'zod';
import { privyClient } from '../privy';
import { parseEther } from 'viem';
import { WalletWithMetadata } from '@privy-io/server-auth';
import { cookies } from 'next/headers';
import { extractCAIP2, getCAIP2ByChain, getSupportedChains } from '../utils';

export const adjustPortfolio = {
    description: 'When user want to adjust their portfolio, you can use this tool to adjust the portfolio based on the mind share, risk appetite, seven day delta and liquidity that the user has proposed, or make adjustments to existing portfolio. PLease format the message in a table',
    parameters: z.object({
        mindShare: z.number().describe('The mind share of the portfolio').optional(),
        riskAppetite: z.number().describe('The risk appetite of the portfolio').optional(),
        sevenDayDelta: z.number().describe('The seven day delta of the portfolio').optional(),
        liquidity: z.number().describe('The liquidity of the portfolio').optional(),
    }),
    execute: async (
        { mindShare, riskAppetite, sevenDayDelta, liquidity }: { mindShare: number, riskAppetite: number, sevenDayDelta: number, liquidity: number }) => {
        try {

            console.log("mindShare", mindShare)
            console.log("riskAppetite", riskAppetite)
            console.log("sevenDayDelta", sevenDayDelta)
            console.log("liquidity", liquidity)

            const existingPortfolio = {
                mindShare: 15,
                riskAppetite: 3,
                sevenDayDelta: 10,
                liquidity: 200000000
            }

            return {
                originalPortfolio: existingPortfolio,
                newPortfolio: {
                    mindShare: mindShare || existingPortfolio.mindShare,
                    riskAppetite: riskAppetite || existingPortfolio.riskAppetite,
                    sevenDayDelta: sevenDayDelta || existingPortfolio.sevenDayDelta,
                    liquidity: liquidity || existingPortfolio.liquidity
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
