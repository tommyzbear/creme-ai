import { privyClient } from '@/lib/privy';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

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

        // Get the file from form data
        const formData = await request.formData();
        const file = formData.get('file') as File;
        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileDir = 'profile_img';
        const fileName = `${claims.userId}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
            .from('Account')
            .upload(fileDir + '/' + fileName, file);

        if (uploadError) {
            throw uploadError;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('Account')
            .getPublicUrl(fileDir + '/' + fileName);

        // Update user profile in database
        const { data, error: updateError } = await supabase
            .from('account')
            .update({ profile_img: publicUrl })
            .eq('id', claims.userId)
            .select()
            .single();

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json({ profile_img: data.profile_img });
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 