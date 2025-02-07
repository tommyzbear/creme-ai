import GradientBackground from "@/components/gradient-background";
import BlurredCursor from "@/components/ui/blurred-cursor";

export const metadata = {
    title: "Login · Crème'ai",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen bg-neutral-200">
            <GradientBackground />
            <BlurredCursor />
            <main className="z-10 mx-auto">{children}</main>
        </div>
    );
}
