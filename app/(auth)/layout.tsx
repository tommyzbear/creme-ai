import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { privyClient } from "@/lib/privy";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <div className="flex min-h-screen">
                    <main className="flex-1 pt-6 w-full">
                        {children}
                    </main>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}