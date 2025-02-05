import { z } from 'zod';
import { privyClient } from '../privy';
import { parseEther } from 'viem';
import { WalletWithMetadata } from '@privy-io/server-auth';
import { cookies } from 'next/headers';
import { extractCAIP2, getCAIP2ByChain, getSupportedChains } from '../utils';

export const adjustPortfolio = {
    description: 'Create portfolio for user base on current data',
    parameters: z.object({}),
    execute: async () => {
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
