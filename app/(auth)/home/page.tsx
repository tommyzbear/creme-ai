"use client";

import { Card } from "@/components/ui/card";
import { usePrivy } from "@privy-io/react-auth";
import { redirect } from "next/navigation";
import { ChatContainer } from "@/components/chat-container";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { PortfolioDashboard } from "@/components/portfolio-dashboard";
import { Suspense } from "react";

export default function HomePage() {
    const { ready, authenticated } = usePrivy();

    if (ready && !authenticated) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen relative">
            <div className="flex gap-2 px-2 py-3 h-screen">
                {/* Left Sidebar */}
                <div className="w-12 h-full">
                    <div className="flex flex-col gap-1 h-full">
                        <div
                            className={cn(
                                "flex justify-center items-center h-16 bg-black/90 rounded-3xl",
                                "backdrop-blur-md backdrop-brightness-125 backdrop-saturate-150"
                            )}
                        >
                            {/* <h1 className="inline-block font-caramel text-7xl text-white font-style-italic">
                                c
                            </h1> */}
                        </div>
                        <Card className="flex-1 bg-black/90" />
                    </div>
                </div>

                {/* Account Balances */}
                <div className="w-1/5 h-full">
                    <div className="flex flex-col gap-1 h-full">
                        <Card className="flex items-center h-16 pl-2 gap-3">
                            {/* <Avatar className="h-12 w-12">
                                <AvatarImage src={"asdfasdf"} />
                                <AvatarFallback className="text-2xl">{"asdfadsf"}</AvatarFallback>
                            </Avatar> */}
                            <div className="flex flex-col items-start">
                                {/* <h3 className="inline-block font-caramel text-6xl">crème'd</h3> */}
                                {/* <h3 className="inline-block font-dinish-condensed text-sm ">
                                    Profile
                                </h3> */}
                            </div>
                        </Card>
                        <Card className="flex-1">
                            <div className="p-6">
                                {/* <h3 className="text-sm text-black">
                                    AI Manager Insight for the day
                                </h3> */}
                            </div>
                        </Card>
                        <Card className="flex-1">
                            <div className="p-6">
                                {/* <h3 className="text-sm">Core indicator based on cookie api</h3> */}
                            </div>
                        </Card>
                        <div className="flex flex-row gap-1">
                            <Card className="px-2 py-0">
                                <div className="flex items-center gap-2 select-none">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <h3 className="inline-block text-sm font-normal">online</h3>
                                </div>
                            </Card>
                            <Card className="px-2 py-0 flex-1">
                                <div className="flex items-center gap-2 justify-center">
                                    <h3 className="inline-block text-sm font-normal select-none">
                                        crème v0.0.1
                                    </h3>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Main Content 1 */}
                <div className="w-1/2 h-full">
                    <Card className="w-full h-full rounded-6xl">
                        <ChatContainer className="" />
                    </Card>
                </div>

                {/* Portfolio Dashboard*/}
                <div className="flex-1 h-full">
                    {/* <Suspense
                        fallback={
                            // swap to skeleton
                            <Card className="w-full h-full rounded-6xl animate-pulse bg-muted" />
                        }
                    > */}
                    <PortfolioDashboard className="frosted-glass w-full h-full rounded-6xl" />
                    {/* </Suspense> */}
                </div>
            </div>
        </div>
    );
}
