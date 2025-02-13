import { privy } from '@/lib/privy';
import { arbitrum, base, mainnet, optimism } from 'viem/chains';
import { StakeKitClient } from '@/lib/services/stakeKit';

export async function POST(req: Request) {
    try {
        await privy.getClaims();

        const { chainId, inputAmount, DeFiOption, safeAddress } = await req.json();
        console.log(chainId, inputAmount, DeFiOption, safeAddress)
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

        const stakeKitClient = new StakeKitClient({
            apiKey: process.env.STAKEKIT_API_KEY || '',
            network: chain.name
        })

        const seesion = await stakeKitClient.createTransactionSession('enter', DeFiOption, safeAddress, inputAmount)
        const txHash = await stakeKitClient.processTransaction(seesion.transactions, safeAddress, chain)

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