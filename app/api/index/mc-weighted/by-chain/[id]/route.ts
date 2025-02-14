import { weighting50sqrt50weighted } from '@/lib/index-calculations';
import { cmcService } from '@/lib/services/coin-market-cap';
import { supabase } from '@/lib/supabase';
import { EnsoToken } from '@/types/data';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    // Add API key validation
    const apiKey = request.headers.get('x-api-key')
    if (!apiKey || apiKey !== process.env.API_KEY) {
        return NextResponse.json(
            { error: "Unauthorized - Invalid API key" },
            { status: 401 }
        )
    }

    try {
        const id = await params.id
        const coins = await cmcService.getByChain(id, (coin) => !coin.tags.includes("stablecoin"));

        const symbols = coins.map((coin) => coin.symbol).slice(0, 20);

        console.log(symbols);

        const { data: ensoTokens, error: ensoTokensError } = await supabase
            .from("enso_tokens")
            .select("*")
            .eq("chain_id", id)
            .in("symbol", symbols);

        if (ensoTokensError) {
            console.error('Failed to fetch enso tokens:', ensoTokensError);
            return NextResponse.json(
                { error: "Failed to fetch enso tokens for chain " + id },
                { status: 500 }
            )
        }

        const availableCoins = coins
            .filter((coin) => (ensoTokens as EnsoToken[]).find((t) => t.symbol === coin.symbol))
            .slice(0, 10)
            .map((coin) => ({
                name: coin.name,
                symbol: coin.symbol,
                market_cap: coin.quote.USD.market_cap,
                address: (ensoTokens as EnsoToken[]).find((t) => t.symbol === coin.symbol)?.address,
            }));

        const mc = availableCoins.reduce((acc, c) => acc + c.market_cap, 0);

        const weightedCoins = availableCoins.map((coin) => {
            return {
                name: coin.name,
                symbol: coin.symbol,
                market_cap: coin.market_cap,
                address: coin.address,
                weight: weighting50sqrt50weighted(coin.market_cap, mc, availableCoins.length)
            }
        })

        return Response.json(weightedCoins);
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