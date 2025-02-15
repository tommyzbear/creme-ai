import { NextResponse } from 'next/server';
import { StakeKitClient } from '@/lib/services/stakeKit';
import { privyClient } from '@/lib/privy';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { arbitrum, base, mainnet, optimism } from 'viem/chains';

export async function POST(request: Request) {
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

        const { chainId } = await request.json();

        // Get safe address
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

        const stakeKitClient = new StakeKitClient({
            apiKey: process.env.STAKEKIT_API_KEY || '',
            network: chain.name
        });

        // Get all positions
        const positions = await stakeKitClient.getYieldBalance(safeWallet.address);
        const validPositions = positions.flat().filter(
            position => Number(position.amount) >= 0.000001 && position.integrationId
        );

        const results = {
            successful: [] as string[],
            failed: [] as string[]
        };

        // Process each position
        for (const position of validPositions) {
            try {
                const session = await stakeKitClient.createExitRequest(
                    position.integrationId!,
                    safeWallet.address,
                    position.amount
                );

                await stakeKitClient.processTransaction(
                    session.transactions,
                    safeWallet.address,
                    chain
                );

                results.successful.push(position.token.symbol);
            } catch (error) {
                console.error(`Failed to exit position ${position.integrationId}:`, error);
                results.failed.push(position.token.symbol);
            }
        }

        return NextResponse.json({
            success: true,
            results
        });
    } catch (error) {
        console.error('Error in exit-all-positions:', error);
        return NextResponse.json(
            { error: 'Failed to exit positions', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
} 