import { privy } from "@/lib/privy";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const claims = await privy.getClaims();

        const { data, error } = await supabase
            .from('safe_wallets')
            .select('*')
            .eq('user_id', claims.userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ address: null }, { status: 404 });
            }
            console.log("Error fetching safe wallet:", error);
            throw new Error(error.message);
        }

        return NextResponse.json({ address: data.address });
    } catch (error) {
        console.error("Error fetching safe wallet:", error);
        return NextResponse.json({ error: "Failed to fetch safe wallet" }, { status: 500 });
    }
}
