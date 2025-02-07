"use client";

import { WalletSelector } from "@/components/wallet-selector";
import { usePortfolioStore } from "@/stores/portfolio-store";
import { CreditCard, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/use-user-store";
import {
    usePrivy,
    useWallets,
    useFundWallet,
    useDelegatedActions,
    type WalletWithMetadata,
} from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ProfileCard } from "@/components/profile-card";

interface AccountCardProps {
    onAccountClick: () => void;
    delegatedWallet?: WalletWithMetadata;
}

export function AccountCard({ onAccountClick }: AccountCardProps) {
    const { selectedWalletAddress, managedWallet, setSelectedWalletAddress } = usePortfolioStore();
    const { user: dbUser, fetchUser } = useUserStore();
    const { ready, user } = usePrivy();
    const { ready: walletReady, wallets } = useWallets();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const { fundWallet } = useFundWallet();
    const { delegateWallet, revokeWallets } = useDelegatedActions();
    const [delegatedWallet, setDelegatedWallet] = useState<WalletWithMetadata | undefined>(
        undefined
    );

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast({
                description: "Copied to clipboard",
                duration: 2000,
            });
        } catch (error) {
            console.error("Failed to copy:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to copy to clipboard",
            });
        }
    };

    useEffect(() => {
        if (!ready || !walletReady) return;

        const loadData = async () => {
            if (!dbUser) {
                console.log("Fetching user data");
                setIsLoading(true);
                await fetchUser();
                setIsLoading(false);
            }
        };

        loadData();
    }, [ready, fetchUser, dbUser, wallets, walletReady]);

    useEffect(() => {
        const embeddedWallets = user?.linkedAccounts.filter(
            (account): account is WalletWithMetadata =>
                account.type === "wallet" && account.walletClientType === "privy"
        );
        const delegatedWallets = embeddedWallets?.filter((wallet) => wallet.delegated);
        if (delegatedWallets && delegatedWallets.length > 0) {
            setDelegatedWallet(delegatedWallets[0]);
        }
    }, [user, revokeWallets]);

    useEffect(() => {
        console.log("selectedWalletAddress", selectedWalletAddress);
    }, [selectedWalletAddress]);

    const handleWalletChange = (address: string) => {
        setSelectedWalletAddress(address);
    };

    return (
        <div
            className={cn(
                "flex flex-col gap-1 max-w-full h-full max-h-[140px]",
                "rounded-2xl frosted-glass bg-white/50",
                "overflow-hidden"
            )}
        >
            <ProfileCard
                profileImage={dbUser?.profile_img || null}
                username={dbUser?.username}
                walletAddress={user?.wallet?.address}
                userID={dbUser?.id}
                onClick={onAccountClick}
            />

            <div
                className={cn("flex flex-row items-center", "gap-1 h-14 px-3 pb-3 pr-4 max-w-full")}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-1 shrink-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-7 bg-white/50 transition-colors duration-200 rounded-lg"
                        onClick={async () => await fundWallet(managedWallet?.address || "")}
                    >
                        <CreditCard className="h-4 w-4" />
                    </Button>

                    {delegatedWallet !== undefined ? (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-7 bg-white/50 transition-colors duration-200 rounded-lg"
                            aria-description="Revoke wallet"
                            onClick={async () => {
                                await revokeWallets();
                                setDelegatedWallet(undefined);
                            }}
                        >
                            <UserX className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-7 bg-white/50 transition-colors duration-200 rounded-lg"
                            aria-description="Delegate wallet"
                            onClick={async () =>
                                await delegateWallet({
                                    address: managedWallet?.address || "",
                                    chainType: "ethereum",
                                })
                            }
                        >
                            <UserCheck className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <WalletSelector
                        selectedWalletAddress={selectedWalletAddress}
                        delegatedWallet={delegatedWallet}
                        managedWallet={managedWallet}
                        onWalletChange={handleWalletChange}
                    />
                </div>
            </div>
        </div>
    );
}
