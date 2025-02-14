import { NextResponse } from 'next/server';
import { StakeKitClient } from '@/lib/services/stakeKit';
import { privyClient } from '@/lib/privy';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const cookieAuthToken = cookieStore.get("privy-token");

        if (!cookieAuthToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const claims = await privyClient.verifyAuthToken(cookieAuthToken.value);
        if (!claims) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch safe address from database
        const { data: safeWallet, error: safeError } = await supabase
            .from('safe_wallets')
            .select('*')
            .eq('user_id', claims.userId)
            .single();

        if (safeError || !safeWallet) {
            return NextResponse.json(
                { error: 'No safe wallet found for this user' },
                { status: 404 }
            );
        }

        const { searchParams } = new URL(request.url);
        const chainId = searchParams.get('chainId');

        if (!chainId) {
            return NextResponse.json(
                { error: 'Chain ID is required' },
                { status: 400 }
            );
        }

        const network = safeWallet.chain;

        const stakeKitClient = new StakeKitClient({
            apiKey: process.env.STAKEKIT_API_KEY || '',
            network: network
        });
        console.log('safeWallet.address:', safeWallet.address);

        const positions = await stakeKitClient.getYieldBalance(safeWallet.address);

        console.log('positions:', positions);
        return NextResponse.json({ positions });
    } catch (error) {
        console.error('Error fetching positions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch positions' },
            { status: 500 }
        );
    }
} 