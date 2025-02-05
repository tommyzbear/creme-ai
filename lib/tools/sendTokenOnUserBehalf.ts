import { z } from 'zod';
import { privyClient } from '../privy';
import { parseEther } from 'viem';
import { WalletWithMetadata } from '@privy-io/server-auth';

export const sendTokenOnUserBehalf = {
    description: 'Send a specify amount of token on behalf of a user to a recipient address',
    parameters: z.object({
        userId: z.string().describe('The user ID of the user to send the token on behalf of'),
        caip2: z.string().describe('The CAIP2 of the chain to send the token on'),
        recipientAddress: z.string().describe('The address of the recipient'),
        amount: z.number().describe('The amount of token to send')
    }),
    execute: async ({ userId, caip2, recipientAddress, amount }: { userId: string, caip2: `eip155:${string}`, recipientAddress: string, amount: number }) => {
        try {
            const user = await privyClient.getUser(userId);
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
            const { hash } = await privyClient.walletApi.ethereum.sendTransaction({
                address: delegatedWallets[0].address,
                chainType: 'ethereum',
                caip2: caip2,
                transaction: {
                    to: recipientAddress as `0x${string}`,
                    value: parseEther(amount.toString()),
                    chainId: 8453,
                },
            });

            return {
                hash: hash,
            };
        } catch (error) {
            console.error('Privy API error:', error);
            throw new Error('Failed to send token on behalf of user');
        }
    }
};
