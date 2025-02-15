import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { privyClient } from '@/lib/privy';
import { cookies } from 'next/headers';

export async function GET(
    request: Request,
    { params }: { params: { session_id: string } }
) {
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

        const { session_id } = await params;

        const { data, error } = await supabase
            .from('chat_sessions')
            .select('content')
            .eq('session_id', session_id)
            .eq('user_id', claims.userId)
            .order('timestamp', { ascending: true })

        if (error) throw error;

        const messages = data.map((item) => item.content)

        return NextResponse.json(messages)
    } catch (error) {
        console.error('Error fetching session messages:', error)
        return NextResponse.json(
            { error: 'Failed to fetch session messages' },
            { status: 500 }
        )
    }
}