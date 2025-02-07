import { z } from 'zod';
import { privyClient } from '../privy';
import { erc20Abi, parseEther, parseUnits, encodeFunctionData } from 'viem';
import { EvmCaip2ChainId, WalletWithMetadata } from '@privy-io/server-auth';
import { cookies } from 'next/headers';
import { extractCAIP2, getCAIP2ByChain, getSupportedChains } from '../utils';
import { odosClient } from '../services/odos';
import { rpcClients } from '../services/rpcClients';
import { NATIVE_TOKEN_ADDRESS, SUPPORTED_TOKENS_BY_CHAIN } from '../constants/token-mappings';
export const swapTokens = {
    description: 'Swap a specify amount of token on behalf of a user',
    parameters: z.object({
        chain: z.string().describe('The chain to send the token on'),
        inputToken: z.string().describe('The input token address').transform((val) => val.toUpperCase()),
        outputToken: z.string().describe('The output token address').transform((val) => val.toUpperCase()),
        amount: z.number().describe('The amount of token to send')
    }),
    execute: async (
        { chain, inputToken, outputToken, amount }: { chain: string, inputToken: string, outputToken: string, amount: number }) => {
        try {
            console.log(chain, inputToken, outputToken, amount);

            const caip2 = getCAIP2ByChain(chain);
            if (!caip2) {
                return {
                    message: 'Invalid chain',
                    supportedChains: getSupportedChains()
                }
            }
            const cookieStore = await cookies();
            const cookieAuthToken = cookieStore.get("privy-token");

            if (!cookieAuthToken) {
                return {
                    error: 'Unauthorized',
                    message: 'Unauthorized'
                }
            }

            const claims = await privyClient.verifyAuthToken(cookieAuthToken.value);

            if (!claims) {
                return {
                    error: 'Unauthorized',
                    message: 'Unauthorized'
                }
            }

            const user = await privyClient.getUser(claims.userId);

            const embeddedWallets = user.linkedAccounts.filter(
                (account): account is WalletWithMetadata =>
                    account.type === 'wallet' && account.walletClientType === 'privy',
            );
            const delegatedWallets = embeddedWallets.filter((wallet) => wallet.delegated);

            if (delegatedWallets.length === 0) {
                return {
                    error: 'No delegated wallet found'
                }
            }

            const inputTokenInfo = SUPPORTED_TOKENS_BY_CHAIN[caip2][inputToken];
            const outputTokenInfo = SUPPORTED_TOKENS_BY_CHAIN[caip2][outputToken];

            console.log("inputTokenInfo", inputTokenInfo);
            console.log("outputTokenInfo", outputTokenInfo);
            const amountInDecimals = inputTokenInfo.decimals === 18 ? parseEther(amount.toString()).toString(10) : parseUnits(amount.toString(), inputTokenInfo.decimals).toString(10);

            const quote = await odosClient.getQuote(
                Number(extractCAIP2(caip2)?.chainId),
                [{
                    tokenAddress: inputTokenInfo.tokenAddress,
                    amount: amountInDecimals
                }],
                [{ tokenAddress: outputTokenInfo.tokenAddress, proportion: 1 }],
                delegatedWallets[0].address,
                0.5
            );

            if (!quote) {
                return {
                    error: 'Failed to get quote',
                }
            }

            let approveHash = "";

            if (inputTokenInfo.tokenAddress !== NATIVE_TOKEN_ADDRESS) {
                try {
                    approveHash = await approveTokenSpending(delegatedWallets[0].address as `0x${string}`, caip2, inputTokenInfo.tokenAddress as `0x${string}`, odosClient.routerAddressByChain[caip2], BigInt(amountInDecimals));
                    await rpcClients[caip2].waitForTransactionReceipt({ hash: approveHash as `0x${string}` })
                } catch (error) {
                    console.error('Privy API error:', error);
                    return {
                        error: error,
                        message: 'Failed to approve token spending'
                    }
                }
            }

            const assembledTransaction = await odosClient.assembleTransaction(quote.pathId, delegatedWallets[0].address);

            if (!assembledTransaction || assembledTransaction.simulation.isSuccess === false) {
                return {
                    error: 'Failed to assemble transaction',
                    message: assembledTransaction?.simulation.simulationError
                }
            }

            // Get the transaction hash from the response
            try {
                // const latestNonce = await rpcClients[caip2].getTransactionCount({ address: delegatedWallets[0].address as `0x${string}` });
                const sendTxResponse = await privyClient.walletApi.ethereum.sendTransaction({
                    address: delegatedWallets[0].address,
                    chainType: 'ethereum',
                    caip2: caip2,
                    transaction: {
                        ...assembledTransaction.transaction,
                        value: `0x${BigInt(assembledTransaction.transaction.value).toString(16)}`,
                    },
                })

                return {
                    swapTransactionHash: getExplorerLink(sendTxResponse.hash, caip2),
                    approveTransactionHash: getExplorerLink(approveHash, caip2),
                    swapPathVizImage: quote.pathVizImage
                };
            } catch (error) {
                console.error('Privy API error:', error);
                return {
                    error: error,
                    message: 'Failed to swap token on behalf of user'
                }
            }
        } catch (error) {
            console.error('Privy API error:', error);
            return {
                error: error,
                message: 'Failed to send token on behalf of user'
            }
        }
    }
};

const approveTokenSpending = async (actionWalletAddress: `0x${string}`, caip2: EvmCaip2ChainId, tokenAddress: `0x${string}`, spenderAddress: `0x${string}`, amount: bigint) => {


    const data = encodeFunctionData({
        abi: erc20Abi,
        functionName: 'approve',
        args: [spenderAddress, amount]
    });

    const { hash } = await privyClient.walletApi.ethereum.sendTransaction({
        address: actionWalletAddress,
        chainType: 'ethereum',
        caip2: caip2,
        transaction: {
            data,
            to: tokenAddress,
            value: `0x0`
        },
    })

    return hash;
}

const getExplorerLink = (hash: string, chain: EvmCaip2ChainId) => {
    switch (chain) {
        case 'eip155:1':
            return `[${hash.slice(0, 6)}...${hash.slice(-4)}](https://etherscan.io/tx/${hash})`;
        case 'eip155:8453':
            return `[${hash.slice(0, 6)}...${hash.slice(-4)}](https://basescan.org/tx/${hash})`;
        case 'eip155:10':
            return `[${hash.slice(0, 6)}...${hash.slice(-4)}](https://optimistic.etherscan.io/tx/${hash})`;
        case 'eip155:42161':
            return `[${hash.slice(0, 6)}...${hash.slice(-4)}](https://arbiscan.io/tx/${hash})`;
        default:
            return `[${hash.slice(0, 6)}...${hash.slice(-4)}](https://basescan.org/tx/${hash})`;
    }
}