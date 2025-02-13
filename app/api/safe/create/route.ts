import { privyClient } from '@/lib/privy';
import { cookies } from 'next/headers';
import { safeService } from '@/lib/services/safe';
import { arbitrum, base, mainnet, optimism } from 'viem/chains';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const cookieAuthToken = cookieStore.get("privy-token");

        if (!cookieAuthToken) {
            throw new Error('Unauthorized');
        }

        const claims = await privyClient.verifyAuthToken(cookieAuthToken.value);

        if (!claims) {
            throw new Error('Unauthorized');
        }

        const { embeddedWalletAddress, ownerAddress } = await req.json();

        const deploymentResults = await safeService.createSafe(
            embeddedWalletAddress,
            ownerAddress
        );

        for (const result of deploymentResults) {
            if ('error' in result) {
                console.error('Failed to create safe:', result.error);
                continue;
            }

            const { safeAddress, deploymentTransaction, chain } = result;

            await supabase
                .from('safe_wallets')
                .insert({
                    address: safeAddress,
                    deployment_tx: deploymentTransaction,
                    user_id: claims.userId,
                    chain_id: chain.id
                });

            return Response.json({
                success: true,
                safeAddress
            });
        }
    } catch (error) {
        console.error('Failed to create safe:', error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create safe'
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