import { privy } from "@/lib/privy";
import { TokenData } from "@/lib/services/alchemy";
import { ensoService } from "@/lib/services/enso";
import { NextResponse } from "next/server";
import { getTokenMetadata } from "@/lib/services/alchemy";
import { extractCAIP2, getAlchemyChainByChainId } from "@/lib/utils";
import { formatEther } from "viem";
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const address = searchParams.get('address') as `0x${string}` | undefined;
        const chainId = searchParams.get('chainId') || '1';
        await privy.getClaims();

        const balances = await ensoService.getBalances(address as `0x${string}`, Number(extractCAIP2(chainId)?.chainId), false);

        const tokenMetadata = await Promise.all(balances.map(async (balance) => {
            const metadata = await getTokenMetadata(balance.token, getAlchemyChainByChainId(chainId));
            if (balance.token === "arb") {
                return {
                    ...metadata,
                    symbol: "ETH",
                    logo: "/icons/ethereum-eth-logo.svg",
                    balance: formatEther(BigInt(balance.amount)),
                    price: Number(balance.price).toFixed(2),
                    value: (Number(formatEther(BigInt(balance.amount))) * Number(balance.price)).toString(),
                    contractAddress: balance.token,
                } as TokenData;
            }

            // For tokens with less than 18 decimals, we need to convert the balance to a more readable format
            // Divided by 10000 to get the last 4 decimal places
            const balanceValue = metadata.decimals === 18 ? formatEther(BigInt(balance.amount)) : (Number(BigInt(balance.amount) * BigInt(10000) / BigInt(10 ** (metadata.decimals))) / 10000).toFixed(4);
            return {
                ...metadata,
                balance: balanceValue,
                price: Number(balance.price).toFixed(2),
                value: (Number(balanceValue) * Number(balance.price)).toString(),
                contractAddress: balance.token,
            } as TokenData;
        }));

        return NextResponse.json(tokenMetadata);
    } catch (error) {
        console.error("Error fetching safe wallet:", error);
        return NextResponse.json({ error: "Failed to fetch safe wallet" }, { status: 500 });
    }
}
