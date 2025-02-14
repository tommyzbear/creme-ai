import { NextResponse } from 'next/server';
import { ensoService } from '@/lib/services/enso';
import { Address } from 'viem';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const underlyingTokens = searchParams.get('underlyingTokens')?.split(',') as Address[] | undefined;
        const address = searchParams.get('address') as Address | undefined;
        const chainId = parseInt(searchParams.get('chainId') || '1');

        const tokenData = await ensoService.getTokenData(chainId, underlyingTokens, address);

        return NextResponse.json(tokenData);
    } catch (error) {
        console.error('Error fetching token data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch token data' },
            { status: 500 }
        );
    }
} 