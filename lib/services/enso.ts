import { EnsoClient, RouteParams } from '@ensofinance/sdk';
import { Address } from 'viem';
const API_KEY = process.env.ENSO_API_KEY;

if (!API_KEY) {
    throw new Error('ENSO_API_KEY is not set');
}

export const enso = new EnsoClient({ apiKey: API_KEY });

const WHITELISTED_LENDING_PROTOCOLS = ["aave-v3", "radiant-v2"]
const WHITELISTED_LP_PROTOCOLS = ["balancer-v2", "sushiswap", "camelot-v2"]

const getTokenData = async (chainId: number, underlyingTokens?: Address | Address[], address?: Address) => {
    const tokenData = await enso.getTokenData({
        underlyingTokens,
        address,
        chainId,
        includeMetadata: true,
    })

    return tokenData.data.map((token) => ({ ...token, address: token.address.toLowerCase() as Address }));
}

const getSupportedProtocols = async () => {
    const protocols = await enso.getProtocolData();

    return protocols.filter((protocol) => protocol.name !== null); // Remove Enso
}

const getLendingTokens = async (chainId: number, underlyingTokens?: Address | Address[], address?: Address, limit: number = 10) => {
    const tokenData = await enso.getTokenData({
        chainId,
        underlyingTokens,
        address,
        includeMetadata: true,
    })

    const lendingTokens = tokenData.data.filter((token) => WHITELISTED_LENDING_PROTOCOLS.includes(token.protocolSlug) && token.apy !== null);

    return lendingTokens.sort((a, b) => (b.apy ?? 0) - (a.apy ?? 0)).slice(0, limit);
}

const getLpTokens = async (chainId: number, underlyingTokens?: Address | Address[], address?: Address, limit: number = 20) => {
    const tokenData = await enso.getTokenData({
        chainId,
        underlyingTokens,
        address,
    })

    const lpTokens = tokenData.data.filter((token) => WHITELISTED_LP_PROTOCOLS.includes(token.protocolSlug) && token.apy !== null);

    return lpTokens.sort((a, b) => (b.apy ?? 0) - (a.apy ?? 0)).slice(0, limit);
}

const getRouterData = async (routeParams: RouteParams) => {
    try {
        const routerData = await enso.getRouterData(routeParams);

        return routerData;
    } catch (error) {
        console.error('Error in getRouterData:', error);
        return null;
    }
}

const getBalances = async (address: `0x${string}`, chainId: number, useEoa: boolean = true) => {
    const balances = await enso.getBalances({
        eoaAddress: address,
        chainId,
        useEoa,
    })

    return balances;
}

export const ensoService = {
    getTokenData,
    getSupportedProtocols,
    getLendingTokens,
    getLpTokens,
    getRouterData,
    getBalances
}