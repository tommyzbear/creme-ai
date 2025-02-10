import { privyClient } from '@/lib/privy';
import { cookies } from 'next/headers';
import { safeService } from '@/lib/services/safe';
import { arbitrum, base, mainnet, optimism } from 'viem/chains';

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const cookieAuthToken = cookieStore.get("privy-token");

        if (!cookieAuthToken) {
            throw new Error('Unauthorized');
        }

        const claims = await privyClient.verifyAuthToken(cookieAuthToken.value);

        if (!claims) {
            throw new Error('Unauthorized');
        }

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

        await safeService.wrapETHAndApprove(
            chain,
            inputAmount,
            safeAddress
        );

        return Response.json({
            success: true
        });
    } catch (error) {
        console.error('Failed to wrap ETH:', error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to wrap ETH'
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