import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@privy-io/react-auth";
import { Copy, Mail, Phone, Wallet } from "lucide-react";
import Image from "next/image";
import { MouseEvent } from "react";

interface ConnectedAccount {
    user: User | null;
    linkEmail: () => void;
    linkPhone: () => void;
    linkWallet: () => void;
    linkGoogle: () => void;
    linkTwitter: () => void;
    linkDiscord: () => void;
    unlinkEmail: (address: string) => Promise<User>;
    unlinkPhone: (number: string) => Promise<User>;
    unlinkWallet: (address: string) => Promise<User>;
    unlinkGoogle: (email: string) => Promise<User>;
    unlinkTwitter: (username: string) => Promise<User>;
    unlinkDiscord: (username: string) => Promise<User>;
    copyToClipboard: (text: string) => void;
}

export function ConnectedAccounts({
    user,
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
}: ConnectedAccount) {
    const getTitle = (type: string) => {
        return type.charAt(0).toUpperCase() + type.slice(1);
    };

    return (
        <div className="mt-6 bg-white/20 rounded-3xl">
            <h3 className="text-base font-semibold px-6 py-4">Connected Accounts</h3>
            <div className="space-y-6 px-6 py-3 pb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5" />
                        <div>
                            <h3 className="font-medium text-base">{getTitle("email")}</h3>
                            <p className="text-sm font-light text-slate-400">
                                {user?.email?.address ?? "Not Connected"}
                            </p>
                        </div>
                    </div>
                    {!user?.email ? (
                        <Button variant="main" onClick={() => linkEmail()}>
                            Connect
                        </Button>
                    ) : (
                        <Button
                            variant="destructive"
                            onClick={() => unlinkEmail(user?.email?.address ?? "")}
                        >
                            Disconnect
                        </Button>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5" />
                        <div>
                            <h3 className="font-medium text-base">{getTitle("phone")}</h3>
                            <p className="text-sm font-light text-slate-400">
                                {user?.phone?.number ?? "Not Connected"}
                            </p>
                        </div>
                    </div>
                    {!user?.phone ? (
                        <Button variant="main" onClick={() => linkPhone()}>
                            Connect
                        </Button>
                    ) : (
                        <Button
                            variant="destructive"
                            onClick={() => unlinkPhone(user?.phone?.number ?? "")}
                        >
                            Disconnect
                        </Button>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Wallet className="h-5 w-5" />
                        <div>
                            <h3 className="font-medium text-base">{getTitle("wallet")}</h3>
                            <button
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() => copyToClipboard(user?.wallet?.address || "")}
                            >
                                <p className="text-sm font-light text-slate-400">
                                    {user?.wallet?.address
                                        ? `${user?.wallet?.address.slice(
                                              0,
                                              6
                                          )}...${user?.wallet?.address.slice(-4)}`
                                        : "Not Connected"}
                                </p>
                                {user?.wallet?.address && (
                                    <Copy className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                                )}
                            </button>
                        </div>
                    </div>
                    {!user?.wallet ? (
                        <Button variant="main" onClick={() => linkWallet()}>
                            Connect
                        </Button>
                    ) : (
                        <Button
                            variant="destructive"
                            onClick={() => unlinkWallet(user?.wallet?.address ?? "")}
                        >
                            Disconnect
                        </Button>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Image
                            src={"/icons/discord.svg"}
                            alt="Discord"
                            width={24}
                            height={24}
                            className="mt-1 brightness-0 invert"
                        />
                        <div>
                            <h3 className="font-medium text-base">{getTitle("discord")}</h3>
                            <p className="text-sm font-light text-slate-400">
                                {user?.discord?.username ?? "Not Connected"}
                            </p>
                        </div>
                    </div>
                    {!user?.discord ? (
                        <Button variant="main" onClick={() => linkDiscord()}>
                            Connect
                        </Button>
                    ) : (
                        <Button
                            variant="destructive"
                            onClick={() => unlinkDiscord(user?.discord?.username ?? "")}
                        >
                            Disconnect
                        </Button>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Image
                            src={"/icons/x.svg"}
                            alt="X"
                            width={24}
                            height={24}
                            className="mt-1 brightness-0 invert"
                        />
                        <div>
                            <h3 className="font-medium text-base">{getTitle("x")}</h3>
                            <p className="text-sm font-light text-slate-400">
                                {user?.twitter?.username ?? "Not Connected"}
                            </p>
                        </div>
                    </div>
                    {!user?.twitter ? (
                        <Button variant="main" onClick={() => linkTwitter()}>
                            Connect
                        </Button>
                    ) : (
                        <Button
                            variant="destructive"
                            onClick={() => unlinkTwitter(user?.twitter?.username ?? "")}
                        >
                            Disconnect
                        </Button>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Image
                            src={"/icons/google.svg"}
                            alt="Google"
                            width={24}
                            height={24}
                            className="mt-1 brightness-0 invert"
                        />
                        <div>
                            <h3 className="font-medium text-base">{getTitle("google")}</h3>
                            <p className="text-sm font-light text-slate-400">
                                {user?.google?.email ?? "Not Connected"}
                            </p>
                        </div>
                    </div>
                    {!user?.google ? (
                        <Button variant="main" onClick={() => linkGoogle()}>
                            Connect
                        </Button>
                    ) : (
                        <Button
                            variant="destructive"
                            onClick={() => unlinkGoogle(user?.google?.email ?? "")}
                        >
                            Disconnect
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
