import { createPublicClient, http } from 'viem';
import { arbitrum as arbitrumChain, base as baseChain, mainnet, optimism as optimismChain } from 'viem/chains';

const ethereum = createPublicClient({
    chain: mainnet,
    transport: http(process.env.ETHEREUM_RPC_URL),
});

const optimism = createPublicClient({
    chain: optimismChain,
    transport: http(process.env.OPTIMISM_RPC_URL),
});

const arbitrum = createPublicClient({
    chain: arbitrumChain,
    transport: http(process.env.ARBITRUM_RPC_URL),
});

const base = createPublicClient({
    chain: baseChain,
    transport: http(process.env.BASE_RPC_URL),
});


export const rpcClients = {
    "eip155:1": ethereum,
    "eip155:10": optimism,
    "eip155:42161": arbitrum,
    "eip155:8453": base
}