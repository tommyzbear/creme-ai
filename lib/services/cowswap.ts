import { TradingSdk, TradeParameters, OrderKind, SigningScheme, SwapAdvancedSettings } from '@cowprotocol/cow-sdk'
import { JsonRpcProvider } from "@ethersproject/providers";
import { VoidSigner } from "@ethersproject/abstract-signer";
import { Chain } from 'viem';
import { getAlchemyRpcByChainId } from './alchemy';

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

    return preSignTransaction
}


export const cowswap = {
    getSwapPreSignTransaction
}