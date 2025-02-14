/**
 * Calculates the combined weighting for a token using 50% square root and 50% equal weighting
 * @param marketCap - The market cap of the individual token
 * @param totalMarketCap - The total market cap of all tokens in the index
 * @param totalTokens - The total number of tokens in the index
 * @returns The combined weighting as a decimal (0-1)
 */
export const weighting50sqrt50weighted = (
    marketCap: number,
    totalMarketCap: number,
    totalTokens: number
): number => {
    // Calculate square root weighting
    const sqrtMarketCap = Math.sqrt(marketCap);
    const sqrtTotal = Math.sqrt(totalMarketCap);
    const sqrtWeighting = sqrtMarketCap / sqrtTotal;

    // Calculate equal weighting (1/n for each token)
    const equalWeighting = 1 / totalTokens;

    // Combine weightings (50% each)
    const combinedWeighting = (sqrtWeighting * 0.5) + (equalWeighting * 0.5);

    return combinedWeighting;
};
