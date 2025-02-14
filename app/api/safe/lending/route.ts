import { privy } from '@/lib/privy';
import { safeService } from '@/lib/services/safe';
import { arbitrum, base, mainnet, optimism } from 'viem/chains';
import { enso, ensoService } from '@/lib/services/enso';
import { supabase } from '@/lib/supabase';

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

        const { chainId, safeAddress, tokenIn } = await req.json();

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

        const lendingTokens = await ensoService.getLendingTokens(chain.id, tokenIn as `0x${string}`);

        if (lendingTokens.length === 0) {
            throw new Error(`No lending tokens found, for ${tokenIn}`);
        }

        const lendingToken = lendingTokens[0];

        const balances = await ensoService.getBalances(safeAddress, chain.id, false);

        const balance = balances.find((balance) => balance.token === tokenIn);

        if (!balance) {
            throw new Error(`No balance found for ${tokenIn}`);
        }

        // Get route data from Enso
        const routeRequest = {
            fromAddress: safeAddress,
            receiver: safeAddress,
            spender: safeAddress,
            chainId: chain.id,
            amountIn: balance.amount,
            tokenIn: tokenIn as `0x${string}`,
            tokenOut: lendingToken.address,
            routingStrategy: "delegate" as const,
        };

        console.log('routeRequest:', routeRequest);

        const routeData = await enso.getRouterData(routeRequest);

        if (!routeData || !routeData.tx) {
            throw new Error('Failed to get route data from Enso');
        }

        // Create and sign transaction using Safe
        const txHash = await safeService.processEnsoTransaction(
            chain,
            safeAddress,
            routeData.tx
        );

        return Response.json({
            success: true,
            txHash
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