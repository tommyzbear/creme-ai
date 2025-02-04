'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { arbitrum, base, mainnet } from 'viem/chains';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
            config={{
                defaultChain: arbitrum,
                supportedChains: [arbitrum, mainnet, base],
                // Customize Privy's appearance in your app
                appearance: {
                    theme: 'light',
                    accentColor: '#676FFF',
                    logo: '/logo.png',
                },
                // Create embedded wallets for users who don't have a wallet
                embeddedWallets: {
                    createOnLogin: 'all-users',
                },
            }}
        >
            {children}
        </PrivyProvider>
    );
}