// import { AppSidebar } from "@/components/app-sidebar";
// import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { privyClient } from "@/lib/privy";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PageTransition from "@/components/page-transition";
import BlurredCursor from "@/components/ui/blurred-cursor";
import GradientBackground from "@/components/gradient-background";
import LeftAside from "@/components/left-aside";

export const metadata = {
    title: "Home",
};

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
                <div className="flex gap-3 px-2 py-3 w-screen h-screen relative">
                    <LeftAside className="w-[21rem] 4xl:w-[30rem] max-h-full h-full transition-[width] duration-700 ease-out" />
                    <main className="flex w-full h-full">{children}</main>
                </div>
            </PageTransition>
        </div>
    );
}
