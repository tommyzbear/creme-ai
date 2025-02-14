import { SidebarProvider } from "@/components/ui/sidebar";
import { SideContent } from "@/components/side-content";
import { SideNav } from "@/components/side-nav";
import { cn } from "@/lib/utils";

export default function LeftAside({ className }: { className?: string }) {
    return (
        <aside className={cn("flex flex-row gap-2", className)}>
            <SidebarProvider className="!min-h-fit !h-full !max-w-12 4xl:!max-w-16">
                <SideNav className="h-full max-w-full" />
            </SidebarProvider>

            <SideContent className="flex-1 h-full w-[calc(21rem-3.5rem)] 4xl:max-w-[calc(30rem-4rem)]" />
        </aside>
    );
}
