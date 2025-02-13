// https://docs.odos.xyz/build/quickstart/sor

const quoteUrl = 'https://api.odos.xyz/sor/quote/v2';
const assembleUrl = 'https://api.odos.xyz/sor/assemble';

const routerAddressByChain = {
    "eip155:1": '0xCf5540fFFCdC3d510B18bFcA6d2b9987b0772559' as `0x${string}`,
    "eip155:42161": '0xa669e7A0d4b3e4Fa48af2dE86BD4CD7126Be4e13' as `0x${string}`,
    "eip155:10": '0xCa423977156BB05b13A2BA3b76Bc5419E2fE9680' as `0x${string}`,
    "eip155:8453": '0x19cEeAd7105607Cd444F5ad10dd51356436095a1' as `0x${string}`
}

const getQuote = async (chainId: number, inputTokens: { tokenAddress: string, amount: string }[], outputTokens: { tokenAddress: string, proportion: number }[], userAddr: string, slippageLimitPercent: number) => {
    const quoteRequestBody = {
        chainId: chainId, // Replace with desired chainId
        inputTokens: inputTokens,
        outputTokens: outputTokens,
        userAddr: userAddr,
        slippageLimitPercent, // set your slippage limit percentage (1 = 1%),
        referralCode: 0, // referral code (recommended)
        disableRFQs: true,
        compact: true,
        // pathVizImage: true // get pathviz graph
    };

    const response = await fetch(
        quoteUrl,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(quoteRequestBody),
        });

    if (response.status === 200) {
        const quote = await response.json();
        return quote; // path are only valid for 60 seconds
    }

    console.error('Error in Quote:', response);
    return null;
}

const assembleTransaction = async (pathId: string, userAddr: string) => {
    const assembleRequestBody = {
        userAddr: userAddr,
        pathId: pathId,
        simulate: true,
    };

    const response = await fetch(
        assembleUrl,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(assembleRequestBody),
        });

    if (response.status === 200) {
        const assembledTransaction = await response.json();
        return assembledTransaction;
    }

    console.error('Error in Transaction Assembly:', response);
    return null;
}

export const odosClient = {
    getQuote,
    assembleTransaction,
    routerAddressByChain
}