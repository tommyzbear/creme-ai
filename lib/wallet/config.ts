import { http, createConfig } from '@wagmi/core'
import { base, arbitrum, optimism, mainnet } from '@wagmi/core/chains'

export const config = createConfig({
    chains: [base, arbitrum, optimism, mainnet],
    transports: {
        [base.id]: http(),
        [arbitrum.id]: http(),
        [optimism.id]: http(),
        [mainnet.id]: http(),
    },
})