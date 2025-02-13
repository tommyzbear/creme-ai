import { ensoService } from '@/lib/services/enso';
import { NextResponse } from 'next/server';
import { Address } from 'viem';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // Parse query parameters
        const chainId = parseInt(searchParams.get('chainId') || '1');
        const underlyingTokens = searchParams.get('underlyingTokens')?.split(',') as Address[] | undefined;
        const address = searchParams.get('address') as Address | undefined;
        const limit = parseInt(searchParams.get('limit') || '10');

        const lpTokens = await ensoService.getLpTokens(
            chainId,
            underlyingTokens,
            address,
            limit
        );

        return NextResponse.json({ data: lpTokens });
    } catch (error) {
        console.error('Error fetching LP tokens:', error);
        return NextResponse.json(
            { error: 'Failed to fetch LP tokens' },
            { status: 500 }
        );
    }
} 