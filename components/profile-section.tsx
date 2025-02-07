import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { type WalletWithMetadata } from "@privy-io/react-auth";
interface ProfileSectionProps {
    username: string | null;
    joinedDate: string | null;
    userId: string | null;
    walletAddress: string | null;
    managedWalletAddress: string | null;
    profilePicture: string | null;
    onOpenChange: (open: boolean) => void;
    copyToClipboard: (text: string) => void;
    logout: () => Promise<void>;
    onUsernameChange: () => void;
    fundWallet: (address: string) => Promise<void>;
    delegatedWallet: WalletWithMetadata | undefined;
    delegateWallet: ({
        address,
        chainType,
    }: {
        address: string;
        chainType: "solana" | "ethereum";
    }) => Promise<void>;
    revokeWallets: () => Promise<void>;
}

export function ProfileSection({
    username,
    joinedDate,
    userId,
    walletAddress,
    managedWalletAddress,
    profilePicture,
    onOpenChange,
    copyToClipboard,
    logout,
    onUsernameChange,
    fundWallet,
    delegatedWallet,
    delegateWallet,
    revokeWallets,
}: ProfileSectionProps) {
    return (
        <div>
            <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20 shadow-lg">
                    <AvatarImage src={profilePicture ?? ""} />
                    <AvatarFallback>
                        <img
                            src="/user-default.webp"
                            alt="Default Profile"
                            className="h-full w-full object-cover"
                        />
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold">{username}</h3>
                            <p className="text-sm font-light text-slate-400">
                                Joined on{" "}
                                {joinedDate ? new Date(joinedDate).toLocaleDateString("en-GB") : ""}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="main" onClick={onUsernameChange}>
                                Change Username
                            </Button>
                            <Button variant="main" onClick={() => onOpenChange(true)}>
                                Change Profile Picture
                            </Button>
                        </div>
                    </div>

                    <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-medium text-slate-400">User ID</h4>
                                <p className="mt-1 font-mono text-sm">{userId}</p>
                            </div>
                            <Button variant="destructive" onClick={logout}>
                                Logout
                            </Button>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-slate-400">
                                Connected Wallets
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="font-mono text-sm">
                                    {walletAddress
                                        ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(
                                            -4
                                        )}`
                                        : ""}
                                </p>
                                <Copy
                                    className="w-4 h-4 cursor-pointer text-gray-500 hover:text-gray-700"
                                    onClick={() => copyToClipboard(walletAddress || "")}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-medium text-slate-400">
                                    Crème'ai Managed Wallet
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="font-mono text-sm">
                                        {managedWalletAddress
                                            ? `${managedWalletAddress.slice(
                                                0,
                                                6
                                            )}...${managedWalletAddress.slice(-4)}`
                                            : ""}
                                    </p>
                                    <Copy
                                        className="w-4 h-4 cursor-pointer text-gray-500 hover:text-gray-700"
                                        onClick={() => copyToClipboard(managedWalletAddress || "")}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="main"
                                    onClick={async () =>
                                        await fundWallet(managedWalletAddress || "")
                                    }
                                >
                                    Fund Wallet
                                </Button>
                                {delegatedWallet !== undefined ? (
                                    <Button
                                        variant="destructive"
                                        onClick={async () => await revokeWallets()}
                                    >
                                        Revoke Delegation
                                    </Button>
                                ) : (
                                    <Button
                                        variant="main"
                                        onClick={async () =>
                                            await delegateWallet({
                                                address: managedWalletAddress || "",
                                                chainType: "ethereum",
                                            })
                                        }
                                    >
                                        Delegate Wallet
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
