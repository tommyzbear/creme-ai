import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { usePrivy } from "@privy-io/react-auth";

interface WalletSelectorProps {
    selectedWalletAddress: string;
    managedWallet: { address: string } | null;
    onWalletChange: (address: string) => void;
}

export function WalletSelector({
    selectedWalletAddress,
    managedWallet,
    onWalletChange,
}: WalletSelectorProps) {
    const { user } = usePrivy();

    return (
        <div className="flex items-center gap-2 w-full">
            <Select value={selectedWalletAddress} onValueChange={onWalletChange}>
                <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Select wallet" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={user?.wallet?.address || "user-wallet"}>
                        User Connected Wallet
                    </SelectItem>
                    {managedWallet && (
                        <SelectItem value={managedWallet?.address || "managed-wallet"}>
                            Creme Managed Wallet
                        </SelectItem>
                    )}
                </SelectContent>
            </Select>
        </div>
    );
}
