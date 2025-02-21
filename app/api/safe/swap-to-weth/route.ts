import { privy } from '@/lib/privy';
import { safeService } from '@/lib/services/safe';
import { arbitrum, base, mainnet, optimism } from 'viem/chains';
import { ensoService } from '@/lib/services/enso';
import { supabase } from '@/lib/supabase';
import { cowswap } from '@/lib/services/cowswap';
import { OrderStatus, TransactionParams } from '@cowprotocol/cow-sdk';
import { odosClient } from '@/lib/services/odos';
import { Chain, erc20Abi } from 'viem';
import { encodeFunctionData } from 'viem';
import { rpcClients } from '@/lib/services/rpcClients';

export async function POST(req: Request) {
    try {
        const claims = await privy.getClaims();

        const { data } = await supabase
            .from('safe_wallets')
            .select('*')
            .eq('user_id', claims.userId)
            .single();

        if (!data) {
            throw new Error('Safe wallet not found');
        }

        const { chainId, safeAddress, tokenIn, viaCowSwap }: { chainId: string, safeAddress: `0x${string}`, tokenIn: `0x${string}`[] | undefined, viaCowSwap: boolean } = await req.json();

        if (safeAddress !== data.address) {
            throw new Error('Please provide your own safe address');
        }

        let chain;
        switch (chainId) {
            case 'eip155:1':
                chain = mainnet;
                break;
            case 'eip155:10':
                chain = optimism;
                break;
            case 'eip155:42161':
                chain = arbitrum;
                break;
            case 'eip155:8453':
                chain = base;
                break;
            default:
                throw new Error(`Unsupported chain: ${chainId}`);
        }

        const safeBalances = await ensoService.getBalances(safeAddress, chain.id, false);

        let balances = []
        if (!tokenIn || tokenIn.length === 0) {
            balances = safeBalances
        } else {
            balances = safeBalances.filter((balance) => tokenIn.includes(balance.token));
        }

        if (!balances || balances.length === 0) {
            throw new Error(`No balance found for ${tokenIn}`);
        }

        const tokenData = await ensoService
            .getTokenData(chain.id, undefined, !tokenIn || tokenIn.length === 0 ? balances.filter((b) => b.token.length === 42).map((b) => b.token) : tokenIn);

        if (tokenData.length === 0 || !tokenData.find((token) => token.type === "base")) {
            throw new Error(`No base token found, for ${tokenIn}`);
        }

        const baseTokens = tokenData.filter((token) => token.type === "base");
        const txHashes = []
        if (viaCowSwap) {
            for (const token of baseTokens) {
                try {
                    const { preSignTransaction, orderId } = await cowswap.getSwapPreSignTransaction(
                        data.address,
                        token.address,
                        token.decimals,
                        cowswap.getWethAddress(chain),
                        18,
                        balances.find((b) => b.token.toLowerCase() === token.address.toLowerCase())?.amount || "0",
                        chain
                    );

                    const txHash = await safeService.preSignCowSwapTransaction(chain, data.address, preSignTransaction);
                    txHashes.push(txHash);

                    let orderStatus = OrderStatus.OPEN;
                    for (let i = 0; i < 3; i++) {
                        orderStatus = await cowswap.getOrderStatusByOrderId(orderId, chain);
                        console.log(`Order status: ${orderStatus}`);
                        if (orderStatus === OrderStatus.FULFILLED || orderStatus === OrderStatus.EXPIRED) {
                            break;
                        }
                        await new Promise(resolve => setTimeout(resolve, 30000));
                    }

                    // TODO: Cancel order if it is not fulfilled or expired
                    // if (orderStatus !== OrderStatus.FULFILLED && orderStatus !== OrderStatus.EXPIRED) {

                    // }
                } catch (error) {
                    console.error(`Failed to swap ${token.address} to WETH:`, error);
                }
            }
        } else {
            // Swap to WETH using Odos
            const inputTokens = baseTokens.map((token) => ({
                tokenAddress: token.address,
                amount: balances.find((b) => b.token.toLowerCase() === token.address.toLowerCase())?.amount || "0"
            }))

            const outputTokens = [{
                tokenAddress: cowswap.getWethAddress(chain),
                proportion: 1
            }]

            for (const token of inputTokens) {
                const approveHash = await approveTokenSpending(chain, data.address, token.tokenAddress, odosClient.routerAddressByChain[chainId], BigInt(token.amount));
                await rpcClients[chainId].waitForTransactionReceipt({ hash: approveHash as `0x${string}` })
            }

            const quote = await odosClient.getQuote(chain.id, inputTokens, outputTokens, data.address, 0.5);
            console.log("quote", quote);

            if (!quote) {
                throw new Error("Failed to get quote");
            }
            const assembledTransaction = await odosClient.assembleTransaction(quote.pathId, data.address);
            console.log("assembledTransaction", assembledTransaction);

            if (!assembledTransaction || assembledTransaction.simulation.isSuccess === false) {
                throw new Error("Failed to assemble transaction");
            }

            const tx = await safeService.initiateTransaction(chain, data.address, assembledTransaction.transaction);
            txHashes.push(tx);
        }

        return Response.json({
            success: true,
            txHashes
        });
    } catch (error) {
        console.error('Failed to lend tokens:', error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to lend tokens'
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


const approveTokenSpending = async (chain: Chain, safeAddress: `0x${string}`, tokenAddress: `0x${string}`, spenderAddress: `0x${string}`, amount: bigint) => {
    const data = encodeFunctionData({
        abi: erc20Abi,
        functionName: 'approve',
        args: [spenderAddress, amount]
    });

    const txHash = await safeService.initiateTransaction(chain, safeAddress, {
        to: tokenAddress,
        data,
        value: `0x0`
    } as TransactionParams);

    return txHash?.hash;
}