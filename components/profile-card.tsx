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
    onClick,
    className,
}: ProfileCardProps) {
    return (
        <div
            className={cn(
                "flex flex-row gap-3 h-20 p-3 cursor-pointer w-full relative",
                "hover:before:opacity-100 before:opacity-0 before:absolute before:inset-0",
                "before:bg-gradient-to-b before:from-white/70 before:to-transparent",
                "before:transition-opacity before:duration-200 before:-z-10",
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
                        {(() => {
                            const hour = new Date().getHours();
                            if (hour >= 5 && hour < 12) return "Morning";
                            if (hour >= 12 && hour < 17) return "Afternoon";
                            if (hour >= 17 && hour < 22) return "Evening";
                            return "Go Sleep";
                        })()}
                        ,
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
