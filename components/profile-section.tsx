import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Copy } from "lucide-react"

interface ProfileSectionProps {
    username: string | null
    joinedDate: string | null
    userId: string | null
    walletAddress: string | null
    profilePicture: string | null
    onOpenChange: (open: boolean) => void
    copyToClipboard: (text: string) => void
    logout: () => Promise<void>
    onUsernameChange: () => void
}

export function ProfileSection({
    username,
    joinedDate,
    userId,
    walletAddress,
    profilePicture,
    onOpenChange,
    copyToClipboard,
    logout,
    onUsernameChange
}: ProfileSectionProps) {

    return (
        <Card>
            <CardHeader>
                <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={profilePicture ?? ''} />
                        <AvatarFallback className="text-2xl">
                            {username}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold">{username}</h3>
                                <p className="text-sm text-muted-foreground">
                                    Joined on {joinedDate ? new Date(joinedDate).toLocaleDateString('en-GB') : ''}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" onClick={onUsernameChange}>
                                    Change Username
                                </Button>
                                <Button variant="outline" onClick={() => onOpenChange(true)}>
                                    Change Profile Picture
                                </Button>
                            </div>
                        </div>

                        <div className="mt-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">User ID</h4>
                                    <p className="mt-1 font-mono text-sm">{userId}</p>
                                </div>
                                <Button variant="outline" onClick={logout}>
                                    Logout
                                </Button>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground">Connected Wallets</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="font-mono text-sm">
                                        {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : ''}
                                    </p>
                                    <Copy
                                        className="w-4 h-4 cursor-pointer text-gray-500 hover:text-gray-700"
                                        onClick={() => copyToClipboard(walletAddress || "")}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
} 