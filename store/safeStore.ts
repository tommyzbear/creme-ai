import { create } from 'zustand'
import { toast } from '@/hooks/use-toast'
import { TokenData } from '@/lib/services/alchemy'
import { TokenData as EnsoTokenData } from '@ensofinance/sdk'
interface SafeStore {
    safeAddress: string
    selectedChain: string
    balances: TokenData[]
    isLoading: boolean
    setSafeAddress: (address: string) => void
    setSelectedChain: (chain: string) => void
    fetchSafeAddress: () => Promise<void>
    fetchBalances: () => Promise<void>
}

export const useSafeStore = create<SafeStore>((set, get) => ({
    safeAddress: '',
    selectedChain: 'eip155:42161',
    balances: [],
    isLoading: false,
    setSafeAddress: (address) => set({ safeAddress: address }),
    setSelectedChain: (chain) => {
        set({ selectedChain: chain })
        get().fetchBalances()
    },
    fetchSafeAddress: async () => {
        try {
            set({ isLoading: true });
            const response = await fetch("/api/safe", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch safe address');
            }

            const data = await response.json();
            set({ safeAddress: data.address, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to fetch safe address",
            });
        }
    },
    fetchBalances: async () => {
        const { safeAddress, selectedChain } = get();
        if (safeAddress) {
            try {
                set({ isLoading: true });
                const response = await fetch(`/api/safe/balance?address=${safeAddress}&chainId=${selectedChain}`);
                if (!response.ok) {
                    set({ isLoading: false });
                    throw new Error('Failed to fetch balances');
                }
                const data = await response.json();

                if (data.length === 0) {
                    set({ balances: [], isLoading: false });
                    return;
                }

                const tokenResponse = await fetch("/api/safe/get-tokens", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        chainId: selectedChain,
                        tokens: data.map((token: TokenData) => token.contractAddress)
                    }),
                });

                if (!tokenResponse.ok) {
                    set({ isLoading: false });
                    throw new Error('Failed to fetch tokens details from Enso');
                }

                const tokenData = await tokenResponse.json();
                const balances = data.map((token: TokenData) => {
                    const tokenDetails = tokenData.find((t: EnsoTokenData) => t.address.toLowerCase() === token.contractAddress);
                    return {
                        ...token,
                        type: tokenDetails?.type
                    };
                });

                set({ balances: balances, isLoading: false });
            } catch (error) {
                console.error('Failed to fetch balances:', error);
                set({ balances: [], isLoading: false });
            }
        }
    }
})); 