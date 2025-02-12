import { defineConfig } from "@gnosis-guild/eth-sdk";

export default defineConfig({
    contracts: {
        mainnet: {
            weth: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
            usdc: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            link: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
            crv: "0xd533a949740bb3306d119cc777fa900ba034cd52",
            cvx: "0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b",
            wbtc: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
            aave: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
            cow: "0xdef1ca1fb7fbcdc777520aa7f396b4e015f497ab"
        },
        arbitrumOne: {
            weth: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
            link: "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
            usdc: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
            crv: "0x11cDb42B0EB46D95f990BeDD4695A6e3fA034978",
            wbtc: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
            aave: "0xba5DdD1f9d7F570dc94a51479a000E3BCE967196",
            gmx: "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a",
            cow: "0xcb8b5CD20BdCaea9a010aC1F8d835824F5C87A04"
        },
        base: {
            weth: "0x4200000000000000000000000000000000000006",
            usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
            ulink: "0xd403D1624DAEF243FbcBd4A80d8A6F36afFe32b2",
            cbBTC: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf"
        },
        // optimism: {
        //     weth: "0x4200000000000000000000000000000000000006",
        //     usdc: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
        //     link: "0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6",
        //     wbtc: "0x68f180fcCe6836688e9084f035309E29Bf0A2095"
        // }
    },
    rpc: {
        arbitrumOne: process.env.ALCHEMY_ARBITRUM_RPC,
        base: process.env.ALCHEMY_BASE_RPC
    }
});