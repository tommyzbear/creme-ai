import { supabase } from '@/lib/supabase';
import { TokenData } from '@ensofinance/sdk';
import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
    // Add API key validation
    const apiKey = request.headers.get('x-api-key')
    const { chainId, startPage } = await request.json();
    if (!apiKey || apiKey !== process.env.API_KEY) {
        return NextResponse.json(
            { error: "Unauthorized - Invalid API key" },
            { status: 401 }
        )
    }

    try {
        let page = startPage;
        while (true) {
            const tokens = await fetch(`https://api.enso.finance/api/v1/tokens?chainId=${chainId}&page=${page}&includeMetadata=true`, {
                headers: {
                    'Authorization': "Bearer " + process.env.ENSO_API_KEY
                }
            })
                .then((res) => res.json())
                .then((data) => data.data);

            if (tokens.length === 0) {
                break;
            }

            const { error } = await supabase
                .from('enso_tokens')
                .upsert(tokens.filter((token: TokenData) => (token.logosUri !== null && token.logosUri.length > 0 || token.protocolSlug !== null) && token.name !== null).map((token: TokenData) => ({
                    chain_id: token.chainId,
                    address: token.address,
                    decimals: token.decimals,
                    name: token.name,
                    symbol: token.symbol,
                    logos_uri: token.logosUri ?? [],
                    type: token.type,
                    protocol_slug: token.protocolSlug,
                    underlying_tokens: token.underlyingTokens ?? [],
                    primary_address: token.primaryAddress ?? '',
                })), {
                    onConflict: 'chain_id,address',
                })
                .select()

            page++;
            if (error) {
                return Response.json({ error: error.message, page }, { status: 500 });
            };
        }


        return Response.json({ ok: true, page });
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