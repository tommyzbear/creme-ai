import { indexService } from '@/lib/services/safe/indexService';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    // Add API key validation
    const apiKey = request.headers.get('x-api-key')
    if (!apiKey || apiKey !== process.env.API_KEY) {
        return NextResponse.json(
            { error: "Unauthorized - Invalid API key" },
            { status: 401 }
        )
    }

    try {
        const id = await params.id
        const weightedCoins = await indexService.getMcWeightedByChain(id);

        return Response.json(weightedCoins);
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