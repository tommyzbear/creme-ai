import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { usePrivy, WalletWithMetadata } from "@privy-io/react-auth";

interface WalletSelectorProps {
    selectedWalletAddress: string;
    delegatedWallet: WalletWithMetadata | undefined;
    managedWallet: { address: string } | null;
    onWalletChange: (address: string) => void;
}

export function WalletSelector({
    selectedWalletAddress,
    delegatedWallet,
    managedWallet,
    onWalletChange,
}: WalletSelectorProps) {
    const { user } = usePrivy();

    return (
        <div className="">
            <Select value={selectedWalletAddress} onValueChange={onWalletChange}>
                <SelectTrigger className="bg-white/40 rounded-xl border-0 transition-colors duration-200 focus:ring-0 focus:outline-none outline-none hover:bg-accent hover:text-accent-foreground">
                    <SelectValue placeholder="Select wallet" />
                </SelectTrigger>
                <SelectContent
                    position="popper"
                    className="w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)] rounded-xl"
                >
                    {user?.wallet?.address === managedWallet?.address ?
                        <>
                            {
                                !delegatedWallet && user?.wallet?.address === managedWallet?.address &&
                                <SelectItem
                                    value={user?.wallet?.address || "user-wallet"}
                                    className="rounded-lg"
                                >
                                    User Connected Wallet
                                </SelectItem>
                            }

                            {
                                delegatedWallet && user?.wallet?.address === delegatedWallet?.address &&
                                <SelectItem
                                    value={managedWallet?.address || "managed-wallet"}
                                    className="rounded-lg"
                                >
                                    Crème Managed Wallet
                                </SelectItem>
                            }
                        </> :
                        <>
                            <SelectItem
                                value={user?.wallet?.address || "user-wallet"}
                                className="rounded-lg"
                            >
                                User Connected Wallet
                            </SelectItem>
                            {managedWallet && (
                                <SelectItem
                                    value={managedWallet?.address || "managed-wallet"}
                                    className="rounded-lg"
                                >
                                    Crème Managed Wallet
                                </SelectItem>
                            )}
                        </>
                    }
                </SelectContent>
            </Select>
        </div>
    );
}
