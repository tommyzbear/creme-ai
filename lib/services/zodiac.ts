// import { allow, EVERYTHING } from "zodiac-roles-sdk/kit";
// import { processPermissions, applyTargets, checkIntegrity, postRole } from "zodiac-roles-sdk";


// const grantTokenPermissions = async (members: `0x${string}`[]) => {
//     const permissions = [
//         allow.arbitrumOne.weth[EVERYTHING],
//         allow.arbitrumOne.usdc[EVERYTHING],
//         allow.arbitrumOne.link[EVERYTHING],
//         allow.arbitrumOne.wbtc[EVERYTHING],
//         allow.arbitrumOne.aave[EVERYTHING],
//         allow.arbitrumOne.gmx[EVERYTHING],
//         allow.arbitrumOne.cow[EVERYTHING],
//         allow.arbitrumOne.crv[EVERYTHING],
//         allow.base.weth[EVERYTHING],
//         allow.base.usdc[EVERYTHING],
//         allow.base.ulink[EVERYTHING],
//         allow.base.cbBTC[EVERYTHING],
//         allow.mainnet.weth[EVERYTHING],
//         allow.mainnet.usdc[EVERYTHING],
//         allow.mainnet.link[EVERYTHING],
//         allow.mainnet.wbtc[EVERYTHING],
//         allow.mainnet.aave[EVERYTHING],
//         allow.mainnet.cow[EVERYTHING],
//         allow.mainnet.crv[EVERYTHING],
//         allow.mainnet.cvx[EVERYTHING],
//     ]
//     const { targets, annotations } = processPermissions(permissions)
//     checkIntegrity(targets)

//     const hash = await postRole({ targets, annotations, members })

//     console.log(`Permissions posted under hash: ${hash}`)

// }
import { allow, apply, exportToSafeTransactionBuilder } from "defi-kit/arb1"
import { encodeBytes32String } from "defi-kit"
import { ETH_ADDRESS } from "@cowprotocol/cow-sdk"
import { WETH_ADDRESS_ARBITRUM } from "../constants/constants"

// Roles are referenced with bytes32 keys.
// Use these helper functions to derive human-readable role identifiers.
const SOL_ADDRESS = "0x2bcC6D6CdBbDC0a4071e48bb3B969b06B3330c07"
const ROLE_KEY = "creme-ai-role"

export const grantTokenPermissions = async () => {
    const permissions = [allow.cowswap.swap({ buy: [ETH_ADDRESS, SOL_ADDRESS, WETH_ADDRESS_ARBITRUM], sell: [ETH_ADDRESS, SOL_ADDRESS, WETH_ADDRESS_ARBITRUM] })]

    const roleKey = encodeBytes32String(ROLE_KEY)

    const calls = await apply(roleKey, permissions, {
        address: "0xd9CfA3466C6f075dEE7055082709fC000358DD81",
        mode: 'extend', // keep the current permissions and add the new ones
        log: console.debug
    })

    // Log the JSON that can be uploaded to the Safe Transaction Builder app for execution
    console.log(exportToSafeTransactionBuilder(calls))


    return calls
}
