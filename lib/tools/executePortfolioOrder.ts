import { z } from 'zod';
import { privyClient } from '../privy';
import { erc20Abi, encodeFunctionData, getAddress, formatEther } from 'viem';
import { EvmCaip2ChainId, WalletWithMetadata } from '@privy-io/server-auth';
import { cookies } from 'next/headers';
import { odosClient } from '../services/odos';
import { rpcClients } from '../services/rpcClients';
import { getETHBalance, getEthBalanceTokenData, getPriceBySymbol, getRecentTransfers, getTokenBalances, getWalletTokens } from '../services/alchemy';
import { NATIVE_TOKEN_ADDRESS, SUPPORTED_TOKENS_BY_CHAIN } from '../constants/token-mappings';
import { supabase } from '../supabase';
import { Portfolio } from '@/types/data';

// TODO: Add support for multiple chains, at the moment only base is supported (more cost effective for mvp development)
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

            const approveHashes: string[] = [];

            inputTokens.forEach(async (inputToken) => {

                if (inputToken.tokenAddress !== NATIVE_TOKEN_ADDRESS) {
                    try {
                        const approveHash = await approveTokenSpending(delegatedWallets[0].address as `0x${string}`, "eip155:8453", inputToken.tokenAddress as `0x${string}`, odosClient.routerAddressByChain["eip155:8453"], BigInt(inputToken.amount));
                        const receipt = await rpcClients["eip155:8453"].waitForTransactionReceipt({ hash: approveHash as `0x${string}` })
                        console.log("receipt", receipt);
                        approveHashes.push(approveHash);
                    } catch (error) {
                        console.error('Privy API error:', error);
                        return {
                            error: error,
                            message: 'Failed to approve token spending'
                        }
                    }
                }
            })

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
                    swapTransactionHash: sendTxResponse.hash,
                    approveTransactionHashes: approveHashes,
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

