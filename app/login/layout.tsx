import GradientBackground from "@/components/gradient-background";
import BlurredCursor from "@/components/ui/blurred-cursor";
import PageTransition from "@/components/page-transition";

export const metadata = {
    title: "Login",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex w-full h-screen bg-neutral-200 justify-center items-center">
            <BlurredCursor />
            <GradientBackground />
            <PageTransition delay={0.5} className="z-10">
                <main className="mx-auto">{children}</main>
            </PageTransition>
        </div>
    );
}
