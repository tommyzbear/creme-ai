import { NextResponse } from 'next/server';
import { StakeKitClient } from '@/lib/services/stakeKit';

export async function POST(request: Request) {
    try {
        const { chainId, tokens } = await request.json();
        // console.log('Received request:', { chainId, tokens });

        // Convert chainId to network name
        let network;
        switch (chainId) {
            case 'eip155:42161':
            case '42161':
                network = 'arbitrum';
                break;
            case 'eip155:1':
            case '1':
                network = 'ethereum';
                break;
            case 'eip155:10':
            case '10':
                network = 'optimism';
                break;
            case 'eip155:8453':
            case '8453':
                network = 'base';
                break;
            default:
                throw new Error(`Unsupported chain: ${chainId}`);
        }

        console.log('Converted network:', network);

        // Normalize token network values
        const normalizedTokens = tokens.map((token: any) => ({
            ...token,
            network: network // Use the converted network name
        }));

        console.log('Normalized tokens:', normalizedTokens);

        const client = new StakeKitClient({
            apiKey: process.env.STAKEKIT_API_KEY || '',
            network
        });

        const yields = await client.getHighestYieldForTokens(network, normalizedTokens);
        // console.log('Yield opportunities found:', yields);

        return NextResponse.json(yields);
    } catch (error) {
        console.error('Error in yield-opportunities:', error);
        return NextResponse.json(
            { error: 'Failed to fetch yield opportunities', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
} 