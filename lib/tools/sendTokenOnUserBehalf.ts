import { z } from 'zod';
import { privyClient } from '../privy';
import { parseEther } from 'viem';
import { WalletWithMetadata } from '@privy-io/server-auth';
import { cookies } from 'next/headers';
import { extractCAIP2, getCAIP2ByChain, getSupportedChains } from '../utils';

export const sendTokenOnUserBehalf = {
    description: 'Send a specify amount of token on behalf of a user to a recipient address',
    parameters: z.object({
        chain: z.string().describe('The chain to send the token on'),
        recipientAddress: z.string().describe('The address of the recipient'),
        amount: z.number().describe('The amount of token to send')
    }),
    execute: async (
        { chain, recipientAddress, amount }: { chain: string, recipientAddress: string, amount: number }) => {
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

            // Get the transaction hash from the response
            try {
                const params = {
                    to: recipientAddress as `0x${string}`,
                    value: `0x${parseEther(amount.toString()).toString(16)}`,
                    chainId: Number(extractCAIP2(caip2)?.chainId),
                }
                const { hash } = await privyClient.walletApi.ethereum.sendTransaction({
                    address: delegatedWallets[0].address,
                    chainType: 'ethereum',
                    caip2: caip2,
                    transaction: params,
                })
                return {
                    hash
                };
            } catch (error) {
                console.error('Privy API error:', error);
                return {
                    error: error,
                    message: 'Failed to send token on behalf of user'
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
