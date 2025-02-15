"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { SideContent } from "@/components/side-content";
import { SideNav } from "@/components/side-nav";
import { cn } from "@/lib/utils";
import { useNewsStore } from "@/stores/news-store";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Preference } from "@/types/data";

export default function LeftAside({ className }: { className?: string }) {
    const { news, fetchNews } = useNewsStore();
    const { toast } = useToast();
    const [preferences, setPreferences] = useState<Partial<Preference>>({
        userProfile: {
            experienceLevel: "",
            portfolioManagementFrequency: "",
            assetsHeld: {
                bitcoin: false,
                ethereum: false,
                altcoins: false,
                stablecoins: false,
                defiTokens: false,
            },
        },
        investmentGoals: {
            goals: [],
            riskLevel: "",
        },
        preferredStrategies: {
            strategies: [],
            diversificationImportance: "",
        },
        web3Engagement: {
            usingDeFiPlatforms: false,
            crossChainInvestments: false,
            activeBlockchainEcosystems: {
                ethereum: false,
                solana: false,
                binanceSmartChain: false,
                arbitrumOptimismBase: false,
            },
        },
        aiCustomizationPreferences: {
            aiRecommendations: [],
            automatedExecutions: "",
            marketMovementAlerts: false,
        },
    });

    const [showPreferences, setShowPreferences] = useState(false);

    useEffect(() => {
        if (!news.length) {
            fetchNews().catch(() => {
                toast({
                    title: "Error fetching news",
                    description: "Please try again later",
                    variant: "destructive",
                });
            });
        }
    }, [fetchNews, toast, news.length]);

    useEffect(() => {
        const fetchPreferences = async () => {
            const response = await fetch("/api/user/preferences");
            if (response.ok) {
                const preferences = await response.json();
                console.log("preferences", preferences);
                setPreferences(preferences);
            } else if (response.status === 404) {
                setShowPreferences(true);
            } else {
                toast({
                    title: "Error fetching user preferences",
                    description: "Please try again later",
                    variant: "destructive",
                });
            }
        };
        fetchPreferences();
    }, [toast]);

    return (
        <>
            <aside className={cn("flex flex-row gap-2", className)}>
                <SidebarProvider className="!min-h-fit !h-full !max-w-12 4xl:!max-w-16">
                    <SideNav
                        className="h-full max-w-full"
                        preferences={preferences}
                        setPreferences={setPreferences}
                        setShowPreferences={setShowPreferences}
                        showPreferences={showPreferences}
                    />
                </SidebarProvider>

                <SideContent className="flex-1 h-full w-[calc(21rem-3.5rem)] 4xl:max-w-[calc(30rem-4rem)]" />
            </aside>
        </>
    );
}
