import { indexService } from '@/lib/services/safe/indexService';
import { z } from 'zod';

export const createPortfolio = {
    description: 'Summarize the data from the response and provide a portfolio suggestion with detailed % split of each token',
    parameters: z.object({
        chain: z.enum(['Arbitrum', 'Optimism', 'Base', 'Ethereum']),
    }),
    execute: async ({ chain }: { chain: string }) => {
        try {
            console.log(`Creating portfolio for chain ${chain}`);
            let chainId = "";
            switch (chain) {
                case 'Arbitrum':
                    chainId = "42161";
                    break;
                case 'Optimism':
                    chainId = "10";
                    break;
                case 'Base':
                    chainId = "8453";
                    break;
                case 'Ethereum':
                    chainId = "1";
                    break;
                default:
                    return {
                        error: 'Invalid chain',
                        message: 'Please select a valid chain from Arbitrum, Optimism, Base, or Ethereum'
                    };
            }

            console.log(`Fetching token allocation for chain ${chainId}`);


            const tokenAllocation = await indexService.getMcWeightedByChain(chainId);
            return tokenAllocation;
        } catch (error) {
            console.error('Portfolio creation error:', error);
            return {
                error,
                message: 'Failed to generate portfolio allocation'
            };
        }
    }
};
