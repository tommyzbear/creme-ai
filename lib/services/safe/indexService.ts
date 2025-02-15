import { supabase } from "@/lib/supabase";
import { cmcService } from "../coin-market-cap";
import { EnsoToken } from "@/types/data";
import { weighting50sqrt50weighted } from "@/lib/index-calculations";

const getMcWeightedByChain = async (chainId: string) => {
    const coins = await cmcService.getByChain(chainId, (coin) => !coin.tags.includes("stablecoin"));

    const symbols = coins.map((coin) => coin.symbol).slice(0, 20);

    console.log(symbols);

    const { data: ensoTokens, error: ensoTokensError } = await supabase
        .from("enso_tokens")
        .select("*")
        .eq("chain_id", chainId)
        .in("symbol", symbols);

    if (ensoTokensError) {
        console.error('Failed to fetch enso tokens:', ensoTokensError);
        throw new Error("Failed to fetch enso tokens for chain " + chainId);
    }

    const availableCoins = coins
        .filter((coin) => (ensoTokens as EnsoToken[]).find((t) => t.symbol === coin.symbol))
        .slice(0, 10)
        .map((coin) => {
            const ensoToken = (ensoTokens as EnsoToken[]).find((t) => t.symbol === coin.symbol);

            return {
                name: coin.name,
                symbol: coin.symbol,
                market_cap: coin.quote.USD.market_cap,
                address: ensoToken?.address,
                decimals: ensoToken?.decimals,
            }
        });

    const mc = availableCoins.reduce((acc, c) => acc + c.market_cap, 0);

    const weightedCoins = availableCoins.map((coin) => {
        return {
            name: coin.name,
            symbol: coin.symbol,
            market_cap: coin.market_cap,
            address: coin.address,
            decimals: coin.decimals,
            weight: weighting50sqrt50weighted(coin.market_cap, mc, availableCoins.length)
        }
    })

    return weightedCoins;
};

export const indexService = {
    getMcWeightedByChain
};