"use client"

import { ProfileSection } from "@/components/profile-section"
import { ConnectedAccounts } from "@/components/connected-accounts"
import { useUserStore } from "@/stores/use-user-store";
import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { UploadProfileImageDialog } from "@/components/dialogs/upload-profile-image-dialog";
import { useToast } from "@/hooks/use-toast";
import { redirect } from "next/navigation";

const MOCK_ACCOUNTS = [
    {
        type: 'twitter',
        value: 'TommyZBear',
        connected: true
    },
    {
        type: 'google',
        value: '',
        connected: false
    },
    {
        type: 'email',
        value: '',
        connected: false
    },
    {
        type: 'phone',
        value: '',
        connected: false
    }
]

export default function AccountPage() {
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
        logout } = usePrivy();
    const [dialogOpen, setDialogOpen] = useState(false);
    const { user: dbUser, error, fetchUser, updateUsername } = useUserStore();
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(true);

    const copyToClipboard = async (text: string) => {

        try {
            await navigator.clipboard.writeText(text);
            toast({
                description: "Copied to clipboard",
                duration: 2000,
            });
        } catch (error) {
            console.error('Failed to copy:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to copy to clipboard",
            });
        }
    };

    useEffect(() => {
        if (!ready) return;
        if (!user) redirect("/login");
        const loadData = async () => {
            setIsLoading(true);
            await fetchUser();
            setIsLoading(false);
        };
        loadData();
    }, [ready, fetchUser, user]);

    if (isLoading) {
        return (
            <div className="max-w-3xl mx-auto space-y-6">
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
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <ProfileSection
                username={dbUser?.username}
                joinedDate={dbUser?.created_at}
                userId={dbUser?.id}
                walletAddress={user?.wallet?.address}
                profilePicture={dbUser?.profile_img}
                onOpenChange={setDialogOpen}
                copyToClipboard={copyToClipboard}
                logout={logout}
            />

            <ConnectedAccounts
                user={user}
                linkEmail={linkEmail}
                linkPhone={linkPhone}
                linkWallet={linkWallet}
                linkGoogle={linkGoogle}
                linkTwitter={linkTwitter}
                linkDiscord={linkDiscord}
                unlinkEmail={unlinkEmail}
                unlinkPhone={unlinkPhone}
                unlinkWallet={unlinkWallet}
                unlinkGoogle={unlinkGoogle}
                unlinkTwitter={unlinkTwitter}
                unlinkDiscord={unlinkDiscord}
                copyToClipboard={copyToClipboard}
            />

            <UploadProfileImageDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
            />
        </div>
    )
} 