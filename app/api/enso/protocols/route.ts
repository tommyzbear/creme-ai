import { privy } from '@/lib/privy';
import { ensoService } from '@/lib/services/enso';

export async function GET() {
    try {
        // Check if user is authenticated
        await privy.getClaims();

        const protocols = await ensoService.getSupportedProtocols();
        return Response.json(protocols);
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