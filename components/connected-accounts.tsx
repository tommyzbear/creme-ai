import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User } from "@privy-io/react-auth"
import { Copy, Mail, Phone, Wallet } from "lucide-react"
import Image from "next/image"

interface ConnectedAccount {
    user: User | null
    linkEmail: () => void
    linkPhone: () => void
    linkWallet: () => void
    linkGoogle: () => void
    linkTwitter: () => void
    linkDiscord: () => void
    unlinkEmail: (address: string) => Promise<User>
    unlinkPhone: (number: string) => Promise<User>
    unlinkWallet: (address: string) => Promise<User>
    unlinkGoogle: (email: string) => Promise<User>
    unlinkTwitter: (username: string) => Promise<User>
    unlinkDiscord: (username: string) => Promise<User>
    copyToClipboard: (text: string) => void
}

export function ConnectedAccounts({ user, linkEmail, linkPhone, linkWallet, linkGoogle, linkTwitter, linkDiscord, unlinkEmail, unlinkPhone, unlinkWallet, unlinkGoogle, unlinkTwitter, unlinkDiscord, copyToClipboard }: ConnectedAccount) {

    const getTitle = (type: string) => {
        return type.charAt(0).toUpperCase() + type.slice(1)
    }

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Connected Accounts</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5" />
                            <div>
                                <h3 className="font-medium">{getTitle('email')}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {user?.email?.address ?? 'Not Connected'}
                                </p>
                            </div>
                        </div>
                        {!user?.email ? (
                            <Button
                                variant="outline"
                                onClick={() => linkEmail()}
                            >
                                Connect
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                onClick={() => unlinkEmail(user?.email?.address ?? '')}
                            >
                                Disconnect
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Phone className="h-5 w-5" />
                            <div>
                                <h3 className="font-medium">{getTitle('phone')}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {user?.phone?.number ?? 'Not Connected'}
                                </p>
                            </div>
                        </div>
                        {!user?.phone ? (
                            <Button
                                variant="outline"
                                onClick={() => linkPhone()}
                            >
                                Connect
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                onClick={() => unlinkPhone(user?.phone?.number ?? '')}
                            >
                                Disconnect
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Wallet className="h-5 w-5" />
                            <div>
                                <h3 className="font-medium">{getTitle('wallet')}</h3>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm text-muted-foreground">
                                        {user?.wallet?.address ? `${user?.wallet?.address.slice(0, 6)}...${user?.wallet?.address.slice(-4)}` : 'Not Connected'}
                                    </p>
                                    {user?.wallet?.address && (
                                        <Copy
                                            className="w-4 h-4 cursor-pointer text-gray-500 hover:text-gray-700"
                                            onClick={() => copyToClipboard(user?.wallet?.address || "")}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                        {!user?.wallet ? (
                            <Button
                                variant="outline"
                                onClick={() => linkWallet()}
                            >
                                Connect
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                onClick={() => unlinkWallet(user?.wallet?.address ?? '')}
                            >
                                Disconnect
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Image src={"/icons/discord.svg"} alt="Discord" width={24} height={24} className="mt-1" />
                            <div>
                                <h3 className="font-medium">{getTitle('discord')}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {user?.discord?.username ?? 'Not Connected'}
                                </p>
                            </div>
                        </div>
                        {!user?.discord ? (
                            <Button
                                variant="outline"
                                onClick={() => linkDiscord()}
                            >
                                Connect
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                onClick={() => unlinkDiscord(user?.discord?.username ?? '')}
                            >
                                Disconnect
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Image src={"/icons/x.svg"} alt="X" width={24} height={24} className="mt-1" />
                            <div>
                                <h3 className="font-medium">{getTitle('x')}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {user?.twitter?.username ?? 'Not Connected'}
                                </p>
                            </div>
                        </div>
                        {!user?.twitter ? (
                            <Button
                                variant="outline"
                                onClick={() => linkTwitter()}
                            >
                                Connect
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                onClick={() => unlinkTwitter(user?.twitter?.username ?? '')}
                            >
                                Disconnect
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Image src={"/icons/google.svg"} alt="Google" width={24} height={24} className="mt-1" />
                            <div>
                                <h3 className="font-medium">{getTitle('google')}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {user?.google?.email ?? 'Not Connected'}
                                </p>
                            </div>
                        </div>
                        {!user?.google ? (
                            <Button
                                variant="outline"
                                onClick={() => linkGoogle()}
                            >
                                Connect
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                onClick={() => unlinkGoogle(user?.google?.email ?? '')}
                            >
                                Disconnect
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
} 