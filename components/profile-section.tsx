import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
                            <p className="text-sm text-muted-foreground">
                                Joined on{" "}
                                {joinedDate ? new Date(joinedDate).toLocaleDateString("en-GB") : ""}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button onClick={onUsernameChange}>Change Username</Button>
                            <Button onClick={() => onOpenChange(true)}>
                                Change Profile Picture
                            </Button>
                        </div>
                    </div>

                    <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground">
                                    User ID
                                </h4>
                                <p className="mt-1 font-mono text-sm">{userId}</p>
                            </div>
                            <Button onClick={logout}>Logout</Button>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">
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
                                <h4 className="text-sm font-medium text-muted-foreground">
                                    Managed Wallet
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
                                    onClick={async () =>
                                        await fundWallet(managedWalletAddress || "")
                                    }
                                >
                                    Fund Wallet
                                </Button>
                                {delegatedWallet !== undefined ? (
                                    <Button onClick={async () => await revokeWallets()}>
                                        Revoke Delegation
                                    </Button>
                                ) : (
                                    <Button
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
