import { z } from 'zod';
import { privyClient } from '../privy';
import { parseEther, parseUnits } from 'viem';
import { WalletWithMetadata } from '@privy-io/server-auth';
import { cookies } from 'next/headers';
import { extractCAIP2, getCAIP2ByChain, getSupportedChains } from '../utils';
import { odosClient } from '../services/odos';

export const swapTokens = {
    description: 'Swap a specify amount of token on behalf of a user',
    parameters: z.object({
        chain: z.string().describe('The chain to send the token on'),
        inputToken: z.string().describe('The input token address'),
        outputToken: z.string().describe('The output token address'),
        amount: z.number().describe('The amount of token to send')
    }),
    execute: async (
        { chain, inputToken, outputToken, amount }: { chain: string, inputToken: string, outputToken: string, amount: number }) => {
        try {

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

            const inputTokenInfo = supportedTokensByChain[caip2][inputToken];
            const outputTokenInfo = supportedTokensByChain[caip2][outputToken];

            const quote = await odosClient.getQuote(
                Number(extractCAIP2(caip2)?.chainId),
                [{
                    tokenAddress: inputTokenInfo.tokenAddress,
                    amount: inputTokenInfo.decimals === 18 ? parseEther(amount.toString()).toString(10) : parseUnits(amount.toString(), inputTokenInfo.decimals).toString(10)
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

            console.log(quote);

            const assembledTransaction = await odosClient.assembleTransaction(quote.pathId, delegatedWallets[0].address);

            if (!assembledTransaction || assembledTransaction.simulation.isSuccess === false) {
                return {
                    error: 'Failed to assemble transaction',
                    message: assembledTransaction?.simulation.simulationError
                }
            }

            console.log(assembledTransaction);

            // Get the transaction hash from the response
            try {
                const { hash } = await privyClient.walletApi.ethereum.sendTransaction({
                    address: delegatedWallets[0].address,
                    chainType: 'ethereum',
                    caip2: caip2,
                    transaction: {
                        ...assembledTransaction.transaction,
                        value: `0x${BigInt(assembledTransaction.transaction.value).toString(16)}`
                    },
                })
                return {
                    hash
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


const supportedTokensByChain = {
    "eip155:1": { // Ethereum
        ETH: {
            tokenAddress: "0x0000000000000000000000000000000000000000",
            decimals: 18
        },
        USDC: {
            tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            decimals: 6
        }
    },
    "eip155:42161": { // Arbitrum
        ETH: {
            tokenAddress: "0x0000000000000000000000000000000000000000",
            decimals: 18
        },
        USDC: {
            tokenAddress: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
            decimals: 6
        }
    },
    "eip155:10": { // Optimism
        ETH: {
            tokenAddress: "0x0000000000000000000000000000000000000000",
            decimals: 18
        },
        USDC: {
            tokenAddress: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
            decimals: 6
        }
    },
    "eip155:8453": { // Base
        ETH: {
            tokenAddress: "0x0000000000000000000000000000000000000000",
            decimals: 18
        },
        USDC: {
            tokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
            decimals: 6
        }
    }
}