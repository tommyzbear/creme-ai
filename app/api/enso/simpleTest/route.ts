import { ensoService } from '@/lib/services/enso';
import { safeService } from '@/lib/services/safe';
import { arbitrum } from 'viem/chains';

export async function GET() {
    try {
        const routerData = await ensoService.getRouterData({
            "amountIn": "1000000000000000",
            "tokenIn": "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
            "tokenOut": "0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8",
            "slippage": 25,
            "fromAddress": "0xd9CfA3466C6f075dEE7055082709fC000358DD81",
            "receiver": "0xd9CfA3466C6f075dEE7055082709fC000358DD81",
            "spender": "0xd9CfA3466C6f075dEE7055082709fC000358DD81",
            "routingStrategy": "delegate",
            "chainId": 42161
        });

        const txResponse = await safeService.initiateTransaction(arbitrum, "0xd9CfA3466C6f075dEE7055082709fC000358DD81", routerData?.tx);

        return Response.json(txResponse);
    } catch (error) {
        console.error('Failed to fetch protocols:', error);
        return new Response(
            JSON.stringify({
                error: error instanceof Error ? error.message : 'Failed to fetch protocols'
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