import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { etherscan } from "./services/etherscan";
import { hasValidTradingVolume } from "./services/dexscreener";
import { arbitrum, base, mainnet, optimism } from "viem/chains";
import { arbiscan } from "./services/arbiscan";
import { WETH_ADDRESS_ARBITRUM, WETH_ADDRESS_MAINNET, WETH_ADDRESS_BASE } from "./constants/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function isLegitToken(contractAddress: string, chain: string): Promise<boolean> {
  if (chain === "eth-mainnet") {
    const [
      // validPrice,
      verifiedOnEtherscan,
      holders,
      // suspiciousName,
      validVolume,
      // trustWalletLogo
    ] = await Promise.all([
      // isValidToken(contractAddress),
      etherscan.isVerifiedOnEtherscan(contractAddress),
      etherscan.getTokenHolders(contractAddress),
      // Promise.resolve(isSuspiciousToken(name)), // Sync function, wrap in Promise for consistency
      hasValidTradingVolume(contractAddress),
      // hasTrustWalletLogo(contractAddress)
    ]);
    // return validPrice && verifiedOnEtherscan && holders > 100 && !suspiciousName && validVolume && trustWalletLogo;
    return verifiedOnEtherscan && holders > 100 && validVolume;
  }

  else if (chain === "arb-mainnet") {
    const [
      verifiedOnArbiscan,
      holders,
      validVolume,
    ] = await Promise.all([
      arbiscan.isVerifiedOnArbiscan(contractAddress),
      arbiscan.getTokenHolders(contractAddress),
      hasValidTradingVolume(contractAddress),
    ]);
    return verifiedOnArbiscan && holders > 100 && validVolume;
  }
  return false;
}

export function getNetworkByChainId(chainId: string) {
  const caip2 = extractCAIP2(chainId);
  if (!caip2) return "Unknown";
  if (caip2.namespace === "eip155") {
    switch (Number(caip2?.chainId)) {
      case base.id:
        return "Base";
      case arbitrum.id:
        return "Arbitrum One";
      case optimism.id:
        return "OP Mainnet";
      case mainnet.id:
        return "Ethereum";
      default:
        return "Unknown";
    }
  }
  else if (caip2.namespace === "solana") {
    return "Solana";
  }
  return "Unknown";
}

export function getAlchemyChainByChainId(chainId: string) {
  const caip2 = extractCAIP2(chainId);
  if (!caip2) return "Unknown";
  if (caip2.namespace === "eip155") {
    switch (Number(caip2?.chainId)) {
      case base.id:
        return "base-mainnet";
      case arbitrum.id:
        return "arb-mainnet";
      case optimism.id:
        return "opt-mainnet";
      case mainnet.id:
        return "eth-mainnet";
      default:
        return "Unknown";
    }
  }
  else if (caip2.namespace === "solana") {
    return "Solana";
  }
  return "Unknown";
}

export function getExplorerByChainId(chainId: string) {
  const caip2 = extractCAIP2(chainId);
  if (!caip2) return "Unknown";
  if (caip2.namespace === "eip155") {
    switch (Number(caip2?.chainId)) {
      case base.id:
        return "https://base.blockscout.com";
      case arbitrum.id:
        return "https://arbiscan.io";
      case optimism.id:
        return "https://optimistic.etherscan.io";
      case mainnet.id:
        return "https://etherscan.io";
      default:
        return "Unknown";
    }
  }
  else if (caip2.namespace === "solana") {
    return "https://solscan.io";
  }
  return "Unknown";
}

export const extractCAIP2 = (input: string): { namespace: string, chainId: string } | null => {
  const pattern = /^([^:]+):(.+)$/; // Captures everything before and after ":"
  const match = input.match(pattern);
  if (match) {
    return { namespace: match[1], chainId: match[2] };
  }
  return null; // Return null if format doesn't match
}

export const getCAIP2ByChain = (chain: string) => {
  switch (chain.toLowerCase()) {
    case "mainnet":
    case "ethereum mainnet":
    case "eth-mainnet":
    case "ethereum":
      return "eip155:1";
    case "arbitrum mainnet":
    case "arbitrum":
    case "arb-mainnet":
      return "eip155:42161";
    case "optimism mainnet":
    case "optimism":
    case "opt-mainnet":
      return "eip155:10";
    case "base mainnet":
    case "base":
    case "base-mainnet":
      return "eip155:8453";
    default:
      return null;
  }
}

export const getSupportedChains = () => {
  return [
    "Ethereum",
    "Arbitrum",
    "Optimism",
    "Base",
  ]
}

export const getWethAddressByChainId = (chainId: number) => {
  switch (chainId) {
    case arbitrum.id:
      return WETH_ADDRESS_ARBITRUM;
    case base.id:
      return WETH_ADDRESS_BASE;
    case mainnet.id:
      return WETH_ADDRESS_MAINNET;
    default:
      throw new Error(`Unsupported chainId: ${chainId}`);
  }
}