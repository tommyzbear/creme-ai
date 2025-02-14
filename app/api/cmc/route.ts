import { cmcService } from '@/lib/services/coin-market-cap';
import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
    // Add API key validation
    const apiKey = request.headers.get('x-api-key')
    const { chainId } = await request.json();
    if (!apiKey || apiKey !== process.env.API_KEY) {
        return NextResponse.json(
            { error: "Unauthorized - Invalid API key" },
            { status: 401 }
        )
    }

    try {
        const coins = await cmcService.getByChain(chainId, (coin) => !coin.tags.includes("stablecoin"));

        return Response.json(coins);
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