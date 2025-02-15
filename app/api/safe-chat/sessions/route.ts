import { privyClient } from '@/lib/privy';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';

export async function GET() {
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

        const { data, error } = await supabase
            .from('chat_sessions')
            .select('session_id, session_name, timestamp')
            .eq('user_id', claims.userId)
            .eq('chat_type', 'safe')
            .order('timestamp', { ascending: false })

        if (error) throw error;

        // Get unique sessions (in case there are duplicates)
        const uniqueSessions = Array.from(
            new Map(data.map(item => [item.session_id, item])).values()
        );

        return Response.json(uniqueSessions);
    } catch (error) {
        console.error('Failed to fetch chat sessions:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
} 