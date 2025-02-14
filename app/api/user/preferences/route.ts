import { privy } from '@/lib/privy';
import { supabase } from '@/lib/supabase';
import { Preference } from '@/types/data';

export async function GET() {
    try {
        const claims = await privy.getClaims();

        const { data, error } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', claims.userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // No data found
                return new Response(null, { status: 404 });
            }
            throw error;
        }

        return Response.json(data.preferences);
    } catch (error) {
        console.error('Failed to fetch user preferences:', error);
        return new Response(
            JSON.stringify({
                error: error instanceof Error ? error.message : 'Failed to fetch user preferences'
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

export async function POST(req: Request) {
    try {
        const claims = await privy.getClaims();
        const preferences: Preference = await req.json();

        const { data, error: upsertError } = await supabase
            .from('user_preferences')
            .upsert({
                user_id: claims.userId,
                preferences,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id'
            })
            .select()
            .single();

        if (upsertError) {
            console.error('Failed to upsert user preferences:', upsertError);
            return new Response(
                JSON.stringify({
                    error: upsertError instanceof Error ? upsertError.message : 'Failed to upsert user preferences'
                }),
                {
                    status: 500,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        return Response.json(data);
    } catch (error) {
        console.error('Failed to save user preferences:', error);
        return new Response(
            JSON.stringify({
                error: error instanceof Error ? error.message : 'Failed to save user preferences'
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