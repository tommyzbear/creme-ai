import { getAlchemyChainByChainId } from '@/lib/utils'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TokenData {
    symbol: string
    balance: string
    price: string
    value: string
    contractAddress: string
    logo: string
}

// Define a Transaction type instead of using any
interface Transaction {
    hash: string
    from: string
    to: string
    value: string
    timestamp: number
    // Add other transaction properties you're using
}

interface PortfolioState {
    userWalletTokens: TokenData[]
    userWalletTransactions: Transaction[]
    managedWalletTokens: TokenData[]
    managedWalletTransactions: Transaction[]
    isLoading: boolean
    currentAddress: string | null
    selectedWalletAddress: string
    setIsLoading: (isLoading: boolean) => void
    fetchPortfolioData: (address: string, chainId: string, isManaged: boolean) => Promise<void>
    clearStore: () => void
    setSelectedWalletAddress: (address: string) => void
}

export const usePortfolioStore = create<PortfolioState>()(
    persist(
        (set, get) => ({
            userWalletTokens: [],
            userWalletTransactions: [],
            managedWalletTokens: [],
            managedWalletTransactions: [],
            isLoading: false,
            currentAddress: null,
            currentChain: null,
            selectedWalletAddress: "",

            setIsLoading: (isLoading) => set({ isLoading }),

            setSelectedWalletAddress: (address: string) => set({ selectedWalletAddress: address }),


            fetchPortfolioData: async (address: string, chainId: string, isManaged: boolean) => {
                if (!address || !chainId) return;

                // Check if we already have data for this address and chain
                const state = get();
                const hasExistingData = isManaged
                    ? state.managedWalletTokens.length > 0
                    : state.userWalletTokens.length > 0;

                if (
                    state.currentAddress === address &&
                    hasExistingData
                ) {
                    return;
                }

                const chain = getAlchemyChainByChainId(chainId);
                set({ isLoading: true });

                try {
                    const response = await fetch(`/api/portfolio?address=${address}&chain=${chain}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch portfolio data');
                    }
                    const data = await response.json();

                    if (isManaged) {
                        set({
                            managedWalletTokens: data.tokens,
                            managedWalletTransactions: data.transactions,
                            currentAddress: address,
                            isLoading: false
                        });
                    } else {
                        set({
                            userWalletTokens: data.tokens,
                            userWalletTransactions: data.transactions,
                            currentAddress: address,
                            isLoading: false
                        });
                    }
                } catch (error) {
                    console.error('Error fetching token data:', error);
                    set({ isLoading: false });
                    throw error;
                }
            },

            clearStore: () => set({
                userWalletTokens: [],
                userWalletTransactions: [],
                managedWalletTokens: [],
                managedWalletTransactions: [],
                isLoading: false,
                currentAddress: null,
                selectedWalletAddress: ""
            })
        }),
        {
            name: 'portfolio-storage',
            partialize: (state) => ({
                userWalletTokens: state.userWalletTokens,
                userWalletTransactions: state.userWalletTransactions,
                managedWalletTokens: state.managedWalletTokens,
                managedWalletTransactions: state.managedWalletTransactions,
                currentAddress: state.currentAddress,
                selectedWalletAddress: state.selectedWalletAddress
            })
        }
    )
) 