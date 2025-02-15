import { privy } from '@/lib/privy';
import { safeService } from '@/lib/services/safe';
import { arbitrum, base, mainnet, optimism } from 'viem/chains';
import { ensoService } from '@/lib/services/enso';
import { supabase } from '@/lib/supabase';
import { cowswap } from '@/lib/services/cowswap';

export async function POST(req: Request) {
    try {
        const claims = await privy.getClaims();

        const { data } = await supabase
            .from('safe_wallets')
            .select('*')
            .eq('user_id', claims.userId)
            .single();

        if (!data) {
            throw new Error('Safe wallet not found');
        }

        const { chainId, safeAddress, tokenIn }: { chainId: string, safeAddress: `0x${string}`, tokenIn: `0x${string}`[] | undefined } = await req.json();

        if (safeAddress !== data.address) {
            throw new Error('Please provide your own safe address');
        }

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

        const safeBalances = await ensoService.getBalances(safeAddress, chain.id, false);

        let balances = []
        if (!tokenIn || tokenIn.length === 0) {
            balances = safeBalances
        } else {
            balances = safeBalances.filter((balance) => tokenIn.includes(balance.token));
        }

        if (!balances || balances.length === 0) {
            throw new Error(`No balance found for ${tokenIn}`);
        }

        const tokenData = await ensoService
            .getTokenData(chain.id, undefined, !tokenIn || tokenIn.length === 0 ? balances.filter((b) => b.token.length === 42).map((b) => b.token) : tokenIn);

        if (tokenData.length === 0 || !tokenData.find((token) => token.type === "base")) {
            throw new Error(`No base token found, for ${tokenIn}`);
        }

        const baseTokens = tokenData.filter((token) => token.type === "base");
        const txHashes = []
        for (const token of baseTokens) {
            try {
                const preSignTransaction = await cowswap.getSwapPreSignTransaction(
                    data.address,
                    token.address,
                    token.decimals,
                    cowswap.getWethAddress(chain),
                    18,
                    balances.find((b) => b.token.toLowerCase() === token.address.toLowerCase())?.amount || "0",
                    chain
                );

                const txHash = await safeService.preSignCowSwapTransaction(chain, data.address, preSignTransaction);
                txHashes.push(txHash);
            } catch (error) {
                console.error(`Failed to swap ${token.address} to WETH:`, error);
            }
        }

        return Response.json({
            success: true,
            txHashes
        });
    } catch (error) {
        console.error('Failed to lend tokens:', error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to lend tokens'
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