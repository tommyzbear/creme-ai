"use client";

import { usePrivy } from "@privy-io/react-auth";
import { redirect } from "next/navigation";
import { AccountDashboard } from "@/components/account-dashboard";

export default function AccountPage() {
    const { ready, user } = usePrivy();

    if (ready && !user) {
        redirect("/login");
    }

    return <AccountDashboard />;
}
