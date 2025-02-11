// import { AppSidebar } from "@/components/app-sidebar";
// import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { privyClient } from "@/lib/privy";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PageTransition from "@/components/page-transition";

import BlurredCursor from "@/components/ui/blurred-cursor";
import GradientBackground from "@/components/gradient-background";

async function checkAuth() {
    const cookieStore = await cookies();
    const cookieAuthToken = cookieStore.get("privy-token");

    if (!cookieAuthToken) return null;

    try {
        const claims = await privyClient.verifyAuthToken(cookieAuthToken.value);
        return claims;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export default async function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const auth = await checkAuth();

    if (!auth) {
        redirect("/login");
    }

    return (
        <div className="flex h-screen bg-neutral-200 w-full justify-center items-center">
            <BlurredCursor />
            <GradientBackground />
            <PageTransition delay={0.5}>
                <main className="flex-1 w-full h-full relative">{children}</main>
            </PageTransition>
        </div>
    );
}
