import { PrivyClient } from "@privy-io/server-auth";

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;

if (!PRIVY_APP_ID || !PRIVY_APP_SECRET) {
    throw new Error("Missing Privy environment variables");
}

export const privyClient = new PrivyClient(PRIVY_APP_ID, PRIVY_APP_SECRET); 