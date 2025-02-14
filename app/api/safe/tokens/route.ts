import { NextRequest, NextResponse } from 'next/server';
import { alchemy } from '@/lib/services/alchemy';
import { getAlchemyChainByChainId } from '@/lib/utils';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const address = searchParams.get('address');
        const chainId = searchParams.get('chainId');

        console.log('Fetching tokens for:', { address, chainId });

        if (!address || !chainId) {
            console.log('Missing required parameters');
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        const alchemyChain = getAlchemyChainByChainId(chainId);
        console.log('Alchemy chain:', alchemyChain);

        const tokens = await alchemy.getTokenBalances(address, alchemyChain);
        console.log('Tokens found:', tokens);

        return NextResponse.json(tokens);
    } catch (error) {
        console.error('Error in /api/safe/tokens:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tokens' },
            { status: 500 }
        );
    }
} 