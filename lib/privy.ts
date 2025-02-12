import { PrivyClient, WalletWithMetadata } from "@privy-io/server-auth";
import { cookies } from 'next/headers';

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
const PRIVY_CLIENT_AUTHORIZATION_KEYPAIR = process.env.PRIVY_CLIENT_AUTHORIZATION_KEYPAIR;
if (!PRIVY_APP_ID || !PRIVY_APP_SECRET) {
    throw new Error("Missing Privy environment variables");
}

export const privyClient = new PrivyClient(PRIVY_APP_ID, PRIVY_APP_SECRET, {
    walletApi: {
        authorizationPrivateKey: PRIVY_CLIENT_AUTHORIZATION_KEYPAIR
    }
});

const getClaims = async () => {
    const cookieStore = await cookies();
    const cookieAuthToken = cookieStore.get("privy-token");

    if (!cookieAuthToken) {
        throw new Error('Unauthorized');
    }

    const claims = await privyClient.verifyAuthToken(cookieAuthToken.value);

    if (!claims) {
        throw new Error('Unauthorized');
    }

    return claims;
}

const getDelegatedWallets = async (userId: string) => {
    const user = await privyClient.getUser(userId);

    const embeddedWallets = user.linkedAccounts.filter(
        (account): account is WalletWithMetadata =>
            account.type === 'wallet' && account.walletClientType === 'privy',
    );
    const delegatedWallets = embeddedWallets.filter((wallet) => wallet.delegated);

    return delegatedWallets;
}

export const privy = {
    getClaims,
    getDelegatedWallets
}