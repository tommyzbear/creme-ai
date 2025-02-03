import { MessageCircle, User, Clock } from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { Separator } from "./ui/separator"
import Image from "next/image"
const menuItems = [
    {
        title: "Chat",
        icon: MessageCircle,
        url: "/chat",
    },
    {
        title: "Account",
        icon: User,
        url: "/account",
    },
    {
        title: "Portfolio",
        icon: Clock,
        url: "/portfolio",
    }
]

export function AppSidebar() {
    return (
        <Sidebar className="border-r" collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild className="py-8">
                            <Link href="/" className="flex items-center font-bold text-xl">
                                <Image src="/round-logo.png" alt="DeFAI Hero" width={56} height={56} />
                                <span className="ml-2">DeFAI Hero</span>
                            </Link>
                        </SidebarMenuButton>

                    </SidebarMenuItem>
                </SidebarMenu>
                <Separator />
            </SidebarHeader>
            <SidebarContent>

                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url} className="flex items-center">
                                            <item.icon className="h-4 w-4 mr-2" />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
} 