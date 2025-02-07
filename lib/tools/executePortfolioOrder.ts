import { z } from 'zod';
import { privyClient } from '../privy';
import { WalletWithMetadata } from '@privy-io/server-auth';
import { cookies } from 'next/headers';
import { odosClient } from '../services/odos';
import { getETHBalance } from '../services/alchemy';
import { SUPPORTED_TOKENS_BY_CHAIN } from '../constants/token-mappings';
import { supabase } from '../supabase';
import { Portfolio } from '@/types/data';

/*
TODO: Add support for multiple chains, at the moment only base is supported (more cost effective for mvp development)
    - Also need to support multiple input tokens
    - i.e. Currently swap would raise an issue if USDC is also input and output token, so need to handle this
*/

export const executePortfolioOrder = {
    description: 'Place or submit a portfolio order',
    parameters: z.object({
        portfolioId: z.number().describe('The id of the portfolio to execute'),
    }),
    execute: async ({ portfolioId }: { portfolioId: number }) => {
        try {
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

            const { data: portfolio, error: portfolioError } = await supabase.from("portfolio")
                .select("*")
                .eq("id", portfolioId)
                .eq("user_id", claims.userId)
                .single();

            if (portfolioError) {
                return {
                    error: portfolioError,
                    message: 'Failed to get portfolio'
                }
            }

            // const tokenBalances = await getTokenBalances(delegatedWallets[0].address, "base-mainnet");
            // console.log("tokenBalances", tokenBalances);
            // const usdcBalance = tokenBalances.filter((token) => SUPPORTED_TOKENS_BY_CHAIN["eip155:8453"]["USDC"].tokenAddress === getAddress(token.contractAddress));

            // For simplicity, we'll just use the ETH balance for now
            const ethBalance = await getETHBalance(delegatedWallets[0].address, "base-mainnet"); // hex string
            const presevedGasCost = BigInt(10000000000000000); // 0.01 ETH

            const inputTokens = [];
            // if (usdcBalance.length > 0) {
            //     inputTokens.push({
            //         tokenAddress: usdcBalance[0].contractAddress,
            //         amount: BigInt(usdcBalance[0].tokenBalance).toString(10)
            //     })
            // }

            inputTokens.push({
                tokenAddress: SUPPORTED_TOKENS_BY_CHAIN["eip155:8453"]["ETH"].tokenAddress,
                amount: (BigInt(ethBalance) - presevedGasCost).toString(10)
            })

            const outputTokens = (portfolio as Portfolio).portfolio
                .filter((t) => t.chainId === 8453 || t.chainId === 0) // 0 is USDC
                .map((t) => {
                    if (t.chainId === 0) {
                        return {
                            tokenAddress: SUPPORTED_TOKENS_BY_CHAIN["eip155:8453"]["USDC"].tokenAddress,
                            proportion: t.weight / 100
                        }
                    }
                    return {
                        tokenAddress: t.token_address,
                        proportion: t.weight / 100
                    }
                });

            const quote = await odosClient.getQuote(
                8453,
                inputTokens,
                outputTokens,
                delegatedWallets[0].address,
                0.5
            );

            console.log("quote", quote);

            if (!quote) {
                return {
                    error: 'Failed to get quote',
                }
            }

            const assembledTransaction = await odosClient.assembleTransaction(quote.pathId, delegatedWallets[0].address);

            if (!assembledTransaction || assembledTransaction.simulation.isSuccess === false) {
                return {
                    error: 'Failed to assemble transaction',
                    message: assembledTransaction?.simulation.simulationError
                }
            }

            console.log("assembledTransaction", assembledTransaction);

            // Get the transaction hash from the response
            try {
                const sendTxResponse = await privyClient.walletApi.ethereum.sendTransaction({
                    address: delegatedWallets[0].address,
                    chainType: 'ethereum',
                    caip2: "eip155:8453",
                    transaction: {
                        gasLimit: `0x${(BigInt(assembledTransaction.transaction.gas) + BigInt(1000000)).toString(16)}`,
                        gasPrice: `0x${(BigInt(assembledTransaction.transaction.gasPrice) + BigInt(1000000)).toString(16)}`,
                        ...assembledTransaction.transaction,
                        value: `0x${BigInt(assembledTransaction.transaction.value).toString(16)}`,
                    },
                })

                return {
                    swapTransactionHash: `[${sendTxResponse.hash.slice(0, 6)}...${sendTxResponse.hash.slice(-4)}](https://basescan.org/tx/${sendTxResponse.hash})`,
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