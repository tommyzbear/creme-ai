import { privy } from '@/lib/privy';
import { alchemy } from '@/lib/services/alchemy';
import { cowswap } from '@/lib/services/cowswap';
import { safeService } from '@/lib/services/safe';
import { supabase } from '@/lib/supabase';
import { getAlchemyChainByChainId } from '@/lib/utils';
import { arbitrum, optimism, base, mainnet } from '@wagmi/core/chains';
import { z } from 'zod';

export const deployStrategy = {
    description: 'Deploy a strategy for a given chain',
    parameters: z.object({
        chainLiteral: z.enum(['Arbitrum', 'Optimism', 'Base', 'Ethereum']),
    }),
    execute: async ({ chainLiteral }: { chainLiteral: string }) => {
        try {
            const claims = await privy.getClaims();
            let chainId = "";
            let chain = null
            switch (chainLiteral) {
                case 'Arbitrum':
                    chainId = "42161";
                    chain = arbitrum;
                    break;
                case 'Optimism':
                    chainId = "10";
                    chain = optimism;
                    break;
                case 'Base':
                    chainId = "8453";
                    chain = base;
                    break;
                case 'Ethereum':
                    chainId = "1";
                    chain = mainnet;
                    break;
                default:
                    return {
                        error: 'Invalid chain',
                        message: 'Please select a valid chain from Arbitrum, Optimism, Base, or Ethereum'
                    };
            }

            const { data: portfolio, error: portfolioError } = await supabase
                .from('safe_portfolio')
                .select('*')
                .eq('user_id', claims.userId)
                .eq('chain_id', chainId)
                .single();

            if (portfolioError) {
                console.error('Portfolio deployment error:', portfolioError);
                return {
                    error: portfolioError,
                    message: 'Failed to deploy strategy'
                };
            }

            if (!portfolio) {
                return {
                    error: 'Portfolio not found',
                    message: 'Please create a portfolio first'
                };
            }

            const { data: safeWallet, error: safeWalletError } = await supabase
                .from('safe_wallets')
                .select('*')
                .eq('user_id', claims.userId)
                .single();

            if (safeWalletError) {
                console.error('Safe wallet deployment error:', safeWalletError);
                return {
                    error: safeWalletError,
                    message: 'Failed to deploy strategy'
                };
            }

            if (!safeWallet) {
                return {
                    error: 'Safe wallet not found',
                    message: 'Please create a safe wallet first'
                };
            }

            const tokenBalances = await alchemy.getTokenBalances(safeWallet.address, getAlchemyChainByChainId("eip155:" + chainId));
            const wethBalance = tokenBalances.find((token) => token.contractAddress === cowswap.getWethAddress(chain).toLowerCase());
            if (!wethBalance) {
                return {
                    error: 'WETH balance not found',
                    message: 'Please add WETH to your safe wallet first'
                };
            }

            const txHashes = [];
            const tokenAllocations = portfolio.portfolio
                .filter((token) => token.symbol !== "ETH" && token.symbol !== "WETH")
                .map(t => ({
                    ...t,
                    weight: t.weight * 100
                }));
            for (const token of tokenAllocations) {
                try {
                    const { preSignTransaction, orderId } = await cowswap.getSwapPreSignTransaction(
                        safeWallet.address,
                        cowswap.getWethAddress(chain),
                        18,
                        token.address,
                        token.decimals,
                        (BigInt(wethBalance?.tokenBalance) * BigInt(Math.floor(token.weight * 100)) / BigInt(100)).toString(10),
                        chain
                    );
                    console.log(orderId)

                    const txHash = await safeService.preSignCowSwapTransaction(chain, safeWallet.address, preSignTransaction);
                    txHashes.push(txHash);
                } catch (error) {
                    console.error('Error deploying strategy:', error);
                }
            }

            return {
                success: true,
                message: 'Strategy deployed successfully',
                // txHashes: txHashes.map((txHash) => `[${txHash.slice(0, 6)}...${txHash.slice(-4)}](${chain.blockExplorers?.default.url}/tx/${txHash})`)
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
