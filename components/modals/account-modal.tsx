"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogOverlay,
} from "@/components/ui/dialog";
import { ProfileSection } from "@/components/profile-section";
import { ConnectedAccounts } from "@/components/connected-accounts";
import { useUserStore } from "@/stores/use-user-store";
import {
    ConnectedWallet,
    useDelegatedActions,
    useFundWallet,
    usePrivy,
    useWallets,
    type WalletWithMetadata,
} from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { UploadProfileImageDialog } from "@/components/dialogs/upload-profile-image-dialog";
import { useToast } from "@/hooks/use-toast";
import { ChangeUsernameDialog } from "@/components/dialogs/change-username-dialog";
import { usePortfolioStore } from "@/store/portfolio-store";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { cn } from "@/lib/utils";
interface AccountModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function DialogWrapper({ children }: { children: React.ReactNode }) {
    return (
        <DialogContent
            className={cn(
                "sm:max-w-3xl",
                "max-h-[calc(100vh-10rem)]",
                "bg-neutral-900/70",
                "text-white",
                "overflow-y-auto",
                "!rounded-3xl"
            )}
        >
            <VisuallyHidden>
                <DialogTitle>Account Settings</DialogTitle>
            </VisuallyHidden>
            {children}
        </DialogContent>
    );
}

export function AccountModal({ open, onOpenChange }: AccountModalProps) {
    const {
        ready,
        user,
        linkEmail,
        linkWallet,
        unlinkEmail,
        linkPhone,
        unlinkPhone,
        unlinkWallet,
        linkGoogle,
        unlinkGoogle,
        linkTwitter,
        unlinkTwitter,
        linkDiscord,
        unlinkDiscord,
        exportWallet,
        logout,
    } = usePrivy();
    const { ready: walletReady, wallets } = useWallets();
    const { fundWallet } = useFundWallet();
    const { delegateWallet, revokeWallets } = useDelegatedActions();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [usernameDialogOpen, setUsernameDialogOpen] = useState(false);
    const [managedWallet, setManagedWallet] = useState<ConnectedWallet | undefined>(undefined);
    const [delegatedWallet, setDelegatedWallet] = useState<WalletWithMetadata | undefined>(
        undefined
    );
    const { user: dbUser, fetchUser, updateUsername } = useUserStore();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

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

        if (wallets.find((w) => w.walletClientType === "privy")) {
            setManagedWallet(wallets.find((w) => w.walletClientType === "privy")!);
        }

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

    const handleLogout = async () => {
        useUserStore.getState().clearStore();
        usePortfolioStore.getState().clearStore();
        await logout();
    };

    const renderLoadingSkeleton = () => (
        <div className="space-y-6">
            <div className="p-6 rounded-lg border border-border">
                <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 rounded-full bg-muted animate-pulse" />
                    <div className="space-y-4">
                        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                        <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                        <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                    </div>
                </div>
            </div>
            <div className="p-6 rounded-lg border border-border">
                <div className="space-y-4">
                    <div className="h-4 w-40 bg-muted animate-pulse rounded" />
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="flex items-center justify-between">
                            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                            <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogOverlay className="backdrop-blur-sm bg-transparent" />
            <DialogWrapper>
                {isLoading ? (
                    renderLoadingSkeleton()
                ) : (
                    <div className="space-y-6">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-semibold">
                                Account Settings
                            </DialogTitle>
                        </DialogHeader>
                        <ProfileSection
                            username={dbUser?.username || null}
                            joinedDate={dbUser?.created_at || null}
                            userId={dbUser?.id || null}
                            walletAddress={user?.wallet?.address || null}
                            managedWalletAddress={managedWallet?.address || null}
                            profilePicture={dbUser?.profile_img || null}
                            onOpenChange={setDialogOpen}
                            onUsernameChange={() => setUsernameDialogOpen(true)}
                            copyToClipboard={copyToClipboard}
                            logout={handleLogout}
                            fundWallet={fundWallet}
                            delegatedWallet={delegatedWallet}
                            delegateWallet={delegateWallet}
                            revokeWallets={async () => {
                                await revokeWallets();
                                setDelegatedWallet(undefined);
                            }}
                        />
                        <ConnectedAccounts
                            user={user}
                            {...{
                                linkEmail,
                                linkPhone,
                                linkWallet,
                                linkGoogle,
                                linkTwitter,
                                linkDiscord,
                                unlinkEmail,
                                unlinkPhone,
                                unlinkWallet,
                                unlinkGoogle,
                                unlinkTwitter,
                                unlinkDiscord,
                                copyToClipboard,
                            }}
                        />
                        <UploadProfileImageDialog open={dialogOpen} onOpenChange={setDialogOpen} />
                        <ChangeUsernameDialog
                            open={usernameDialogOpen}
                            onOpenChange={setUsernameDialogOpen}
                            currentUsername={dbUser?.username}
                            onUpdate={updateUsername}
                        />
                    </div>
                )}
            </DialogWrapper>
        </Dialog>
    );
}
