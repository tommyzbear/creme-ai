import { NextRequest, NextResponse } from 'next/server'
import { ensoService } from '@/lib/services/enso'
import { Address } from 'viem';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const underlyingTokens = searchParams.get('underlyingTokens')?.split(',') as Address[] | undefined;
        const address = searchParams.get('address') as Address | undefined;
        const chainId = parseInt(searchParams.get('chainId') || '1') // Default to Ethereum mainnet
        const limit = parseInt(searchParams.get('limit') || '10')

        const tokens = await ensoService.getLendingTokens(chainId, underlyingTokens, address, limit)
        return NextResponse.json(tokens)
    } catch (error) {
        console.error('Error fetching APY data:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}