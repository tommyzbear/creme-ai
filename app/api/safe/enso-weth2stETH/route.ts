import { privy } from '@/lib/privy';
import { safeService } from '@/lib/services/safe';
import { arbitrum, base, mainnet, optimism } from 'viem/chains';
import { enso } from '@/lib/services/enso';

export async function POST(req: Request) {
    try {
        await privy.getClaims();

        const { chainId, inputAmount, safeAddress } = await req.json();

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

        // Get route data from Enso
        const routeRequest = {
            fromAddress: safeAddress,
            receiver: safeAddress,
            spender: safeAddress,
            chainId: chain.id,
            amountIn: inputAmount,
            tokenIn: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1" as `0x${string}`, // WETH on arbitrum
            tokenOut: "0x5979D7b546E38E414F7E9822514be443A4800529" as `0x${string}`, // wstETH on arbitrum
            routingStrategy: "delegate" as const,
        };

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
        console.error('Failed to swap WETH to stETH:', error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to swap WETH to stETH'
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