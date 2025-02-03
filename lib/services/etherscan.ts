const ETHERSCAN_API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY

interface TokenBalance {
    contractAddress: string
    tokenName: string
    symbol: string
    divisor: number
    balance: string
    type: string
}

interface EtherscanTokenBalance {
    contractAddress: string
    tokenName: string
    symbol: string
    divisor: string
    balance: string
    type: string
}

export async function getWalletTokens(address: string): Promise<TokenBalance[]> {
    try {
        // First get the list of tokens owned by the wallet
        const response = await fetch(
            `https://api.etherscan.io/api?module=account&action=tokenlist&address=${address}&apikey=${ETHERSCAN_API_KEY}`
        )
        const data = await response.json()

        console.log("data", data)

        if (data.status === "1" && data.result) {
            // Filter out tokens with zero balance
            return data.result
                .filter((token: EtherscanTokenBalance) =>
                    Number(token.balance) > 0
                )
                .map((token: EtherscanTokenBalance) => ({
                    contractAddress: token.contractAddress,
                    tokenName: token.tokenName,
                    symbol: token.symbol,
                    divisor: Number(`1e${token.divisor}`),
                    balance: token.balance,
                    type: token.type
                }))
        }
        return []
    } catch (error) {
        console.error('Error fetching tokens:', error)
        return []
    }
}

/**
 * Check if a token is verified on Etherscan
 */
export async function isVerifiedOnEtherscan(contractAddress: string): Promise<boolean> {
    try {
        const url = `https://api.etherscan.io/api?module=token&action=tokeninfo&contractaddress=${contractAddress}&apikey=${ETHERSCAN_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        return data.status === "1" && data.result && data.result.length > 0;
    } catch (error) {
        console.error("Etherscan error:", error);
        return false;
    }
}

/**
 * Get the number of holders of a token from Etherscan
 */
export async function getTokenHolders(contractAddress: string): Promise<number> {
    try {
        const url = `https://api.etherscan.io/api?module=token&action=tokenholdercount&contractaddress=${contractAddress}&apikey=${ETHERSCAN_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        return parseInt(data.result || "0");
    } catch (error) {
        console.error("Etherscan holder count error:", error);
        return 0;
    }
}