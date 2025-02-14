import { SidebarProvider } from "@/components/ui/sidebar";
import { SideContent } from "@/components/side-content";
import { SideNav } from "@/components/side-nav";

export default function LeftAside() {
    return (
        <aside className="flex flex-row w-[21rem] max-h-full h-full gap-2 ">
            <SidebarProvider className="!min-h-fit !h-full !max-w-12">
                <SideNav className="h-full max-w-full" />
            </SidebarProvider>

            <SideContent className="flex-1 h-full max-w-[calc(21rem-3.5rem)]" />
        </aside>
    );
}
