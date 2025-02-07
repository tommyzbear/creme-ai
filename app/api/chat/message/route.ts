import { privyClient } from '@/lib/privy';
import { cookies } from 'next/headers';
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

        const { session_id, session_name, role, content } = await req.json();

        await supabase.from('chat_sessions').upsert({
            user_id: claims.userId,
            session_name: session_name,
            session_id: session_id,
            role: role,
            content
        });

        return new Response('Message saved', { status: 201 });
    } catch (error) {
        console.error('Failed to save chat message:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
} 