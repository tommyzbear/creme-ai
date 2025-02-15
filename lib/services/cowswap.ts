import { TradingSdk, TradeParameters, OrderKind, SigningScheme, SwapAdvancedSettings, OrderBookApi, OrderSigningUtils, OrderStatus } from '@cowprotocol/cow-sdk'
import { JsonRpcProvider } from "@ethersproject/providers";
import { VoidSigner } from "@ethersproject/abstract-signer";
import { Chain } from 'viem';
import { getAlchemyRpcByChainId } from './alchemy';
import { WETH_ADDRESS_BASE } from '../constants/constants';
import { WETH_ADDRESS_ARBITRUM } from '../constants/constants';
import { WETH_ADDRESS_MAINNET } from '../constants/constants';

const APP_CODE = process.env.COWSWAP_APP_CODE

const getSwapPreSignTransaction = async (
    smartContractWalletAddress: string,
    sellToken: string,
    sellTokenDecimals: number,
    buyToken: string,
    buyTokenDecimals: number,
    amount: string,
    chain: Chain) => {
    const traderParams = {
        chainId: chain.id,
        signer: new VoidSigner(
            smartContractWalletAddress,
            new JsonRpcProvider(getAlchemyRpcByChainId(chain.id))
        ),
        appCode: APP_CODE,
    };

    const sdk = new TradingSdk(traderParams, { enableLogging: false });

    const parameters: TradeParameters = {
        kind: OrderKind.SELL,
        sellToken,
        sellTokenDecimals,
        buyToken,
        buyTokenDecimals,
        amount,
        slippageBps: 100, // 1% to ensure execution
    };

    const advancedParameters: SwapAdvancedSettings = {
        quoteRequest: {
            // Specify the signing scheme
            signingScheme: SigningScheme.PRESIGN,
        },
    };

    const orderId = await sdk.postSwapOrder(parameters, advancedParameters);
    console.log(`Order ID: [${orderId}]`);

    const preSignTransaction = await sdk.getPreSignTransaction({
        orderId,
        account: smartContractWalletAddress,
    });

    return { preSignTransaction, orderId }
}

const getOrderStatusByOrderId = async (orderId: string, chain: Chain) => {
    const orderBookApi = new OrderBookApi({ chainId: chain.id })

    const order = await orderBookApi.getOrder(orderId)

    if (!order) {
        throw new Error('Order not found')
    }

    return order.status
}

// const cancelOrderById = async (orderId: string, chain: Chain) => {
//     const orderSigningUtils = new OrderSigningUtils()

//     const orderCancellationSigningResult = await OrderSigningUtils.signOrderCancellations([orderId], chain.id, signer)

//     const orderCancellationTransaction = await OrderSigningUtils.getOrderCancellationTransaction(orderCancellationSigningResult, chain.id)

//     return orderCancellationTransaction
// }


const getWethAddress = (chain: Chain) => {
    switch (chain.id) {
        case 1:
            return WETH_ADDRESS_MAINNET
        case 42161:
            return WETH_ADDRESS_ARBITRUM
        case 8453:
            return WETH_ADDRESS_BASE
        default:
            throw new Error(`Unsupported chain: ${chain.id}`)
    }
}


export const cowswap = {
    getSwapPreSignTransaction,
    getWethAddress,
    getOrderStatusByOrderId
}