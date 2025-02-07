import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileCardProps {
    profileImage?: string | null;
    username?: string | null;
    userID?: string | null;
    walletAddress?: string | null;
    className?: string;
    onClick?: () => void;
}

export function ProfileCard({
    profileImage,
    username,
    userID,
    walletAddress,
    onClick,
    className,
}: ProfileCardProps) {
    return (
        <div
            className={cn(
                "flex flex-row gap-3 h-20 p-3 cursor-pointer w-full",
                " hover:bg-gradient-to-b from-white/80 to-transparent",
                className
            )}
            onClick={onClick}
        >
            <Avatar className="h-14 w-14 shrink-0">
                <AvatarImage src={profileImage ?? ""} />
                <AvatarFallback>
                    <img
                        src="/user-default.webp"
                        alt="Default Profile"
                        className="h-full w-full object-cover"
                    />
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <div className="w-full overflow-hidden">
                    <h3 className="text-lg font-medium font-bricolage leading-none truncate">
                        Evening,
                        <br />
                        {username || "Anon"}
                    </h3>
                    {/* <span className="pt-2 text-sm text-muted-foreground truncate block">
                        {walletAddress
                            ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                            : "No wallet connected"}
                    </span> */}
                    <span className="pt-2 text-sm text-muted-foreground truncate block pr-2">
                        {userID || "No ID connected"}
                    </span>
                </div>
            </div>
        </div>
    );
}
