import { privy } from '@/lib/privy';
import { arbitrum, base, mainnet, optimism } from 'viem/chains';
import { ensoService } from '@/lib/services/enso';

export async function POST(req: Request) {
    try {
        // Authenticate user
        await privy.getClaims();

        const { chainId, tokens }: { chainId: string, tokens: `0x${string}`[] } = await req.json();

        if (tokens.length === 0) {
            throw new Error('No tokens provided');
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

        const tokenData = await ensoService.getTokenData(chain.id, undefined, tokens.filter(token => token.length === 42));

        if (tokenData.length === 0) {
            throw new Error(`No tokens found, for ${tokens.join(', ')}`);
        }

        return Response.json(tokenData);
    } catch (error) {
        console.error('Failed to get tokens:', error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get tokens'
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