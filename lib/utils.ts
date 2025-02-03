import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { getTokenHolders } from "./services/etherscan";
import { hasValidTradingVolume } from "./services/dexscreener";
import { isVerifiedOnEtherscan } from "./services/etherscan";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function isLegitToken(contractAddress: string): Promise<boolean> {

  const [
    // validPrice,
    verifiedOnEtherscan,
    holders,
    // suspiciousName,
    validVolume,
    // trustWalletLogo
  ] = await Promise.all([
    // isValidToken(contractAddress),
    isVerifiedOnEtherscan(contractAddress),
    getTokenHolders(contractAddress),
    // Promise.resolve(isSuspiciousToken(name)), // Sync function, wrap in Promise for consistency
    hasValidTradingVolume(contractAddress),
    // hasTrustWalletLogo(contractAddress)
  ]);

  // return validPrice && verifiedOnEtherscan && holders > 100 && !suspiciousName && validVolume && trustWalletLogo;
  return verifiedOnEtherscan && holders > 100 && validVolume;
}
