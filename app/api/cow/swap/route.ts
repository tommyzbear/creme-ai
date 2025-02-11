import { privy } from '@/lib/privy';
import { cowswap } from '@/lib/services/cowswap';
import { arbitrum, base, mainnet, optimism } from 'viem/chains';
import { supabase } from '@/lib/supabase';
import { safeService } from '@/lib/services/safe';
import { alchemy } from '@/lib/services/alchemy';
import { getAlchemyChainByChainId } from '@/lib/utils';

interface TokenAllocation {
    token: string;
    symbol: string;
    percentage: number;
    address: string;
    decimals: number;
}

export async function POST(req: Request) {
    try {
        const claims = await privy.getClaims();

        const { data, error } = await supabase
            .from('safe_wallets')
            .select('*')
            .eq('user_id', claims.userId)
            .single();

        if (error) {
            console.log("Error fetching safe wallet:", error);
            throw new Error(error.message);
        }

        const { tokens, ethAmount, chainId }: {
            tokens: TokenAllocation[],
            ethAmount: string,
            chainId: string
        } = await req.json();

        let chain;
        switch (chainId) {
            case 'eip155:1':
                chain = mainnet;
                break;
            case 'eip155:10':
                chain = optimism;
                break;
            case 'eip155:42161':
                chain = arbitrum;
                break;
            case 'eip155:8453':
                chain = base;
                break;
            default:
                throw new Error(`Unsupported chain: ${chainId}`);
        }

        const tokenBalances = await alchemy.getTokenBalances(data.address, getAlchemyChainByChainId(chainId));
        const wethBalance = tokenBalances.find((token) => token.contractAddress === cowswap.getWethAddress(chain).toLowerCase());

        // If the balance is less than the amount, wrap the ETH and approve the WETH
        if (BigInt(wethBalance?.tokenBalance || 0) < BigInt(ethAmount)) {
            const difference = BigInt(ethAmount) - BigInt(wethBalance?.tokenBalance || 0);
            await safeService.wrapETHAndApprove(chain, difference.toString(10), data.address);
        }

        // TODO: Need to handle cases where the swap completed half way through
        for (const token of tokens) {
            if (token.symbol === "ETH") continue // Skip ETH as it's already in the wallet

            const preSignTransaction = await cowswap.getSwapPreSignTransaction(
                data.address,
                cowswap.getWethAddress(chain),
                18,
                token.address,
                token.decimals,
                (BigInt(ethAmount) * BigInt(Math.floor(token.percentage * 100)) / BigInt(10000)).toString(10),
                chain
            );

            await safeService.preSignCowSwapTransaction(chain, data.address, preSignTransaction);
        }

        return Response.json({
            success: true,
            message: "Swap orders created successfully"
        });
    } catch (error) {
        console.error('Failed to create swap orders:', error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create swap orders'
            }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }
} 