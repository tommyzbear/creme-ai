import { TokenData, Transfer } from "@/lib/services/alchemy";
import { getAlchemyChainByChainId } from "@/lib/utils";
import { ConnectedWallet } from "@privy-io/react-auth";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PortfolioState {
    userWalletTokens: TokenData[];
    userWalletTransactions: Transfer[];
    managedWalletTokens: TokenData[];
    managedWalletTransactions: Transfer[];
    isLoading: boolean;
    selectedWalletAddress: string | undefined;
    currentChainId: string;
    setIsLoading: (isLoading: boolean) => void;
    fetchPortfolioData: (address: string, chainId: string, isManaged: boolean) => Promise<void>;
    clearStore: () => void;
    setSelectedWalletAddress: (address: string) => void;
    setCurrentChainId: (chainId: string) => void;
    managedWallet: ConnectedWallet | null;
    setManagedWallet: (wallet: ConnectedWallet | null) => void;
    userWallet: string | undefined;
    setUserWallet: (address: string | null) => void;
}

export const usePortfolioStore = create<PortfolioState>()(
    persist(
        (set, get) => ({
            userWalletTokens: [],
            userWalletTransactions: [],
            managedWalletTokens: [],
            managedWalletTransactions: [],
            isLoading: false,
            currentChain: null,
            selectedWalletAddress: "",
            currentChainId: "eip155:1",
            managedWallet: null,
            userWallet: undefined,

            setIsLoading: (isLoading) => set({ isLoading }),

            setSelectedWalletAddress: (address: string) => set({ selectedWalletAddress: address }),

            setCurrentChainId: (chainId: string) => {
                set({ currentChainId: chainId });
                if (get().selectedWalletAddress) {
                    const managedAddress = get().managedWallet?.address;
                    const userAddress = get().userWallet;

                    if (managedAddress) {
                        get().fetchPortfolioData(managedAddress, chainId, true);
                    }
                    if (userAddress) {
                        get().fetchPortfolioData(userAddress, chainId, false);
                    }
                }
            },

            fetchPortfolioData: async (address: string, chainId: string, isManaged: boolean) => {
                if (!address || !chainId) return;

                const chain = getAlchemyChainByChainId(chainId);
                set({ isLoading: true });

                try {
                    const response = await fetch(
                        `/api/portfolio?address=${address}&chain=${chain}`
                    );
                    if (!response.ok) {
                        throw new Error("Failed to fetch portfolio data");
                    }
                    const data = await response.json();

                    if (isManaged) {
                        set({
                            managedWalletTokens: data.tokens,
                            managedWalletTransactions: data.transactions,
                            isLoading: false,
                        });
                    } else {
                        set({
                            userWalletTokens: data.tokens,
                            userWalletTransactions: data.transactions,
                            isLoading: false,
                        });
                    }
                } catch (error) {
                    console.error("Error fetching token data:", error);
                    set({ isLoading: false });
                    throw error;
                }
            },

            clearStore: () =>
                set({
                    userWalletTokens: [],
                    userWalletTransactions: [],
                    managedWalletTokens: [],
                    managedWalletTransactions: [],
                    isLoading: false,
                    selectedWalletAddress: undefined,
                    userWallet: undefined,
                    managedWallet: null,
                }),

            setManagedWallet: (wallet) => set({ managedWallet: wallet }),

            setUserWallet: (address: string | null) => set({ userWallet: address || undefined }),
        }),
        {
            name: "portfolio-storage",
            partialize: (state) => ({
                userWalletTokens: state.userWalletTokens,
                userWalletTransactions: state.userWalletTransactions,
                managedWalletTokens: state.managedWalletTokens,
                managedWalletTransactions: state.managedWalletTransactions,
                selectedWalletAddress: state.selectedWalletAddress,
                userWallet: state.userWallet,
                managedWallet: state.managedWallet,
                currentChainId: state.currentChainId,
            }),
        }
    )
);
