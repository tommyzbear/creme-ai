"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogOverlay,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Preference,
    ExperienceLevel,
    ManagementFrequency,
    DiversificationImportance,
    AutomatedExecutions,
    RiskLevel,
} from "@/types/data";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Stepper } from "@/components/ui/stepper";
import { Rocket, PartyPopper } from "lucide-react";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/stores/chat-store";
import { Message, useChat } from "ai/react";

const defaultPreferences: Preference = {
    userProfile: {
        experienceLevel: "Beginner",
        portfolioManagementFrequency: "Monthly",
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
        riskLevel: 3,
    },
    preferredStrategies: {
        strategies: [],
        diversificationImportance: "Somewhat important",
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
        automatedExecutions: "Mixed",
        marketMovementAlerts: false,
    },
};

interface PreferencesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    preferences: Partial<Preference>;
    setPreferences: (
        preferences: Partial<Preference> | ((prev: Partial<Preference>) => Partial<Preference>)
    ) => void;
}

type DialogState = "welcome" | "form" | "completion" | "closed";

const steps = [
    "User Profile & Experience",
    "Investment Goals & Risk Appetite",
    "Preferred Investment Strategies",
    "Web3 & DeFi Engagement",
    "AI Customization Preferences",
];

export function PreferencesDialog({
    open,
    onOpenChange,
    preferences,
    setPreferences,
}: PreferencesDialogProps) {
    const [activeStep, setActiveStep] = useState(0);
    const [dialogState, setDialogState] = useState<DialogState>("welcome");
    const { toast } = useToast();
    const router = useRouter();
    const { startNewChat, sessionId, addSession, setSessionName } = useChatStore();
    // const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
    const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
        api: "/api/chat",
        maxSteps: 5,
        id: sessionId,
        onFinish: (message: Message) => {
            try {
                fetch("/api/chat/message", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        session_id: sessionId,
                        session_name: "Portfolio Building",
                        role: "assistant",
                        content: message.content,
                    }),
                });
            } catch (error) {
                console.error(`Failed to save assistant message:`, error);
            }
        },
        onError: (error) => {
            console.error("Chat error:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to process your request",
            });
        },
        onToolCall: (toolCall) => {
            console.log("toolCall", toolCall);
        },
    });

    const resetPreferences = () => {
        setPreferences({
            userProfile: {
                experienceLevel: "" as ExperienceLevel,
                portfolioManagementFrequency: "" as ManagementFrequency,
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
                riskLevel: "" as unknown as RiskLevel,
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
    };

    useEffect(() => {
        if (open) {
            setActiveStep(0);
            setDialogState("welcome");
        } else {
            setDialogState("closed");
        }
    }, [open]);

    const calculateStepCompletion = (step: number): number => {
        const initialFilled = 0.05;
        switch (step) {
            case 0: {
                const totalFields = 3; // experienceLevel, portfolioManagementFrequency, at least one asset
                let filled = 0;
                if (preferences.userProfile?.experienceLevel) filled++;
                if (preferences.userProfile?.portfolioManagementFrequency) filled++;
                if (
                    preferences.userProfile?.assetsHeld &&
                    Object.values(preferences.userProfile.assetsHeld).some((v) => v)
                )
                    filled++;
                if (filled === 0) return initialFilled;
                return filled / totalFields;
            }
            case 1: {
                const totalFields = 2; // goals (at least 1) and riskLevel
                let filled = 0;
                if (preferences.investmentGoals?.goals?.length ?? 0 > 0) filled++;
                if (preferences.investmentGoals?.riskLevel) filled++;
                if (filled === 0) return initialFilled;
                return filled / totalFields;
            }
            case 2: {
                const totalFields = 2; // strategies (at least 1) and diversificationImportance
                let filled = 0;
                if (preferences.preferredStrategies?.strategies?.length ?? 0 > 0) filled++;
                if (preferences.preferredStrategies?.diversificationImportance) filled++;
                if (filled === 0) return initialFilled;
                return filled / totalFields;
            }
            case 3: {
                const totalFields = 2; // usingDeFiPlatforms, crossChainInvestments, at least one ecosystem
                let filled = 0;
                if (
                    preferences.web3Engagement?.usingDeFiPlatforms !== false ||
                    preferences.web3Engagement?.crossChainInvestments !== false
                )
                    filled++;
                if (
                    preferences.web3Engagement?.activeBlockchainEcosystems &&
                    Object.values(preferences.web3Engagement.activeBlockchainEcosystems).some(
                        (v) => v
                    )
                )
                    filled++;
                if (filled === 0) return initialFilled;
                return filled / totalFields;
            }
            case 4: {
                const totalFields = 2; // aiRecommendations (at least 1), automatedExecutions, marketMovementAlerts
                let filled = 0;
                if ((preferences.aiCustomizationPreferences?.aiRecommendations?.length ?? 0) > 0)
                    filled++;
                if (preferences.aiCustomizationPreferences?.automatedExecutions) filled++;
                if (filled === 0) return initialFilled;
                return filled / totalFields;
            }
            default:
                return initialFilled;
        }
    };

    const handleNext = async () => {
        setActiveStep((prev) => prev + 1);

        const response = await fetch("/api/user/preferences", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(preferences),
        });

        if (!response.ok) {
            console.error("Failed to save preferences:", response.statusText);
            toast({
                title: "Error saving preferences",
                description: response.statusText,
                variant: "destructive",
            });
            return;
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handlePreferencesSubmit = async () => {
        try {
            const response = await fetch("/api/user/preferences", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(preferences),
            });

            if (!response.ok) {
                console.error("Failed to save preferences:", response.statusText);
                toast({
                    title: "Error saving preferences",
                    description: response.statusText,
                    variant: "destructive",
                });
                return;
            }
            setDialogState("completion");
        } catch (error) {
            console.error("Error saving preferences:", error);
        }
    };

    const handleStepClick = (step: number) => {
        setActiveStep(step);
    };

    const handleStartPortfolio = async () => {
        onOpenChange(false);
        startNewChat();
        // setSessionName("Portfolio Building");
        handleInputChange({ target: { value: "Build me a crypto portfolio!" } } as any);
        setTimeout(() => {
            handleSubmit(new Event("submit") as any);
        }, 500);
    };

    type InvestmentGoal =
        | "Long-term wealth accumulation"
        | "Passive income through staking/yield farming"
        | "High-risk, high-reward investing"
        | "Portfolio diversification";
    type Strategy =
        | "HODLing"
        | "Active rebalancing"
        | "Yield farming & liquidity provision"
        | "Staking for passive income";
    type AIRecommendation =
        | "Market trends & analysis"
        | "Portfolio rebalancing suggestions"
        | "Yield optimization opportunities"
        | "Indicator signals";

    const renderFormContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <Label>
                                What is your experience level with cryptocurrency investing?
                            </Label>
                            <RadioGroup
                                value={preferences.userProfile?.experienceLevel || ""}
                                onValueChange={(value: "Beginner" | "Intermediate" | "Advanced") =>
                                    setPreferences((prev: Partial<Preference>) => ({
                                        ...prev,
                                        userProfile: {
                                            ...prev.userProfile!,
                                            experienceLevel: value || undefined,
                                        },
                                    }))
                                }
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Beginner" id="beginner" />
                                    <Label htmlFor="beginner" className="cursor-pointer">
                                        Beginner
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Intermediate" id="intermediate" />
                                    <Label htmlFor="intermediate" className="cursor-pointer">
                                        Intermediate
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Advanced" id="advanced" />
                                    <Label htmlFor="advanced" className="cursor-pointer">
                                        Advanced
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="space-y-4">
                            <Label>How often do you actively manage your crypto portfolio?</Label>
                            <RadioGroup
                                value={preferences.userProfile?.portfolioManagementFrequency || ""}
                                onValueChange={(value: "Daily" | "Weekly" | "Monthly" | "Rarely") =>
                                    setPreferences((prev: Partial<Preference>) => ({
                                        ...prev,
                                        userProfile: {
                                            ...prev.userProfile!,
                                            portfolioManagementFrequency: value || undefined,
                                        },
                                    }))
                                }
                            >
                                {["Daily", "Weekly", "Monthly", "Rarely"].map((frequency) => (
                                    <div key={frequency} className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value={frequency}
                                            id={frequency.toLowerCase()}
                                        />
                                        <Label
                                            htmlFor={frequency.toLowerCase()}
                                            className="cursor-pointer"
                                        >
                                            {frequency}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>

                        <div className="space-y-4">
                            <Label>What types of assets do you currently hold?</Label>
                            <div className="grid grid-cols-2 gap-4">
                                {Object.entries(preferences.userProfile?.assetsHeld || {}).map(
                                    ([key, value]) =>
                                        key !== "other" && (
                                            <div key={key} className="flex items-center space-x-2">
                                                <Checkbox
                                                    className=""
                                                    id={key}
                                                    checked={value}
                                                    onCheckedChange={(checked: boolean) =>
                                                        setPreferences(
                                                            (prev: Partial<Preference>) => ({
                                                                ...prev,
                                                                userProfile: {
                                                                    ...prev.userProfile!,
                                                                    assetsHeld: {
                                                                        ...prev.userProfile!
                                                                            .assetsHeld,
                                                                        [key]: checked,
                                                                    },
                                                                },
                                                            })
                                                        )
                                                    }
                                                />
                                                <Label
                                                    htmlFor={key}
                                                    className="capitalize cursor-pointer"
                                                >
                                                    {key.replace(/([A-Z])/g, " $1").trim()}
                                                </Label>
                                            </div>
                                        )
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 1:
                return (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <Label>What are your primary investment goals? (Select up to 2)</Label>
                            <div className="grid gap-4">
                                {[
                                    "Long-term wealth accumulation",
                                    "Passive income through staking/yield farming",
                                    "High-risk, high-reward investing",
                                    "Portfolio diversification",
                                ].map((goal) => (
                                    <div key={goal} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={goal}
                                            checked={preferences.investmentGoals?.goals.includes(
                                                goal as InvestmentGoal
                                            )}
                                            disabled={
                                                preferences.investmentGoals?.goals.length === 2 &&
                                                !preferences.investmentGoals?.goals.includes(
                                                    goal as InvestmentGoal
                                                )
                                            }
                                            onCheckedChange={(checked: boolean) =>
                                                setPreferences((prev: Partial<Preference>) => ({
                                                    ...prev,
                                                    investmentGoals: {
                                                        ...prev.investmentGoals!,
                                                        goals: checked
                                                            ? [
                                                                  ...prev.investmentGoals!.goals,
                                                                  goal as InvestmentGoal,
                                                              ]
                                                            : prev.investmentGoals!.goals.filter(
                                                                  (g) => g !== goal
                                                              ),
                                                    },
                                                }))
                                            }
                                        />
                                        <Label htmlFor={goal} className="cursor-pointer">
                                            {goal}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label>Risk Level (1-5)</Label>
                            <Slider
                                value={[preferences.investmentGoals?.riskLevel || 3]}
                                min={1}
                                max={5}
                                step={1}
                                onValueChange={([value]: number[]) =>
                                    setPreferences((prev: Partial<Preference>) => ({
                                        ...prev,
                                        investmentGoals: {
                                            ...prev.investmentGoals!,
                                            riskLevel: value as RiskLevel,
                                        },
                                    }))
                                }
                            />
                            <div className="flex justify-between text-sm text-slate-300/50">
                                <span>Very Low</span>
                                <span>Very High</span>
                            </div>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <Label>Which investment strategies are you most interested in?</Label>
                            <div className="grid gap-4">
                                {[
                                    "HODLing",
                                    "Active rebalancing",
                                    "Yield farming & liquidity provision",
                                    "Staking for passive income",
                                ].map((strategy) => (
                                    <div key={strategy} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={strategy}
                                            checked={preferences.preferredStrategies?.strategies.includes(
                                                strategy as Strategy
                                            )}
                                            onCheckedChange={(checked: boolean) =>
                                                setPreferences((prev: Partial<Preference>) => ({
                                                    ...prev,
                                                    preferredStrategies: {
                                                        ...prev.preferredStrategies!,
                                                        strategies: checked
                                                            ? [
                                                                  ...prev.preferredStrategies!
                                                                      .strategies,
                                                                  strategy as Strategy,
                                                              ]
                                                            : prev.preferredStrategies!.strategies.filter(
                                                                  (s) => s !== strategy
                                                              ),
                                                    },
                                                }))
                                            }
                                        />
                                        <Label htmlFor={strategy} className="cursor-pointer">
                                            {strategy}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label>How important is diversification in your portfolio?</Label>
                            <RadioGroup
                                value={
                                    preferences.preferredStrategies?.diversificationImportance || ""
                                }
                                onValueChange={(
                                    value: "Very important" | "Somewhat important" | "Not important"
                                ) =>
                                    setPreferences((prev: Partial<Preference>) => ({
                                        ...prev,
                                        preferredStrategies: {
                                            ...prev.preferredStrategies!,
                                            diversificationImportance: value || undefined,
                                        },
                                    }))
                                }
                            >
                                {[
                                    ["Very important", "Want exposure to multiple narratives"],
                                    [
                                        "Somewhat important",
                                        "Mostly focused on key good performing narratives",
                                    ],
                                    [
                                        "Not important",
                                        "Prefer to concentrate on specific assets or narratives",
                                    ],
                                ].map(([value, description]) => (
                                    <div key={value} className="flex items-center space-x-2">
                                        <RadioGroupItem value={value} id={value} />
                                        <div className="flex flex-col">
                                            <Label htmlFor={value} className="cursor-pointer">
                                                {value}
                                            </Label>
                                            <span className="text-sm text-slate-300/50">
                                                {description}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <Label>DeFi Platform Usage</Label>
                            <div className="grid gap-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="usingDeFiPlatforms"
                                        checked={preferences.web3Engagement?.usingDeFiPlatforms}
                                        onCheckedChange={(checked: boolean) =>
                                            setPreferences((prev: Partial<Preference>) => ({
                                                ...prev,
                                                web3Engagement: {
                                                    ...prev.web3Engagement!,
                                                    usingDeFiPlatforms: checked,
                                                },
                                            }))
                                        }
                                    />
                                    <Label htmlFor="usingDeFiPlatforms" className="cursor-pointer">
                                        Currently using DeFi platforms
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="crossChainInvestments"
                                        checked={preferences.web3Engagement?.crossChainInvestments}
                                        onCheckedChange={(checked: boolean) =>
                                            setPreferences((prev: Partial<Preference>) => ({
                                                ...prev,
                                                web3Engagement: {
                                                    ...prev.web3Engagement!,
                                                    crossChainInvestments: checked,
                                                },
                                            }))
                                        }
                                    />
                                    <Label
                                        htmlFor="crossChainInvestments"
                                        className="cursor-pointer"
                                    >
                                        Interested in cross-chain investments
                                    </Label>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label>Which blockchain ecosystems are you most active in?</Label>
                            <div className="grid grid-cols-2 gap-4">
                                {Object.entries(
                                    preferences.web3Engagement?.activeBlockchainEcosystems || {}
                                ).map(
                                    ([key, value]) =>
                                        key !== "other" && (
                                            <div key={key} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={key}
                                                    checked={value}
                                                    onCheckedChange={(checked: boolean) =>
                                                        setPreferences(
                                                            (prev: Partial<Preference>) => ({
                                                                ...prev,
                                                                web3Engagement: {
                                                                    ...prev.web3Engagement!,
                                                                    activeBlockchainEcosystems: {
                                                                        ...prev.web3Engagement!
                                                                            .activeBlockchainEcosystems,
                                                                        [key]: checked,
                                                                    },
                                                                },
                                                            })
                                                        )
                                                    }
                                                />
                                                <Label
                                                    htmlFor={key}
                                                    className="capitalize cursor-pointer"
                                                >
                                                    {key === "arbitrumOptimismBase"
                                                        ? "L2s (Arbitrum/Optimism/Base)"
                                                        : key.replace(/([A-Z])/g, " $1").trim()}
                                                </Label>
                                            </div>
                                        )
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <Label>What type of AI recommendations are you interested in?</Label>
                            <div className="grid gap-4">
                                {[
                                    "Market trends & analysis",
                                    "Portfolio rebalancing suggestions",
                                    "Yield optimization opportunities",
                                    "Indicator signals",
                                ].map((recommendation) => (
                                    <div
                                        key={recommendation}
                                        className="flex items-center space-x-2"
                                    >
                                        <Checkbox
                                            id={recommendation}
                                            checked={preferences.aiCustomizationPreferences?.aiRecommendations.includes(
                                                recommendation as AIRecommendation
                                            )}
                                            onCheckedChange={(checked: boolean) =>
                                                setPreferences((prev: Partial<Preference>) => ({
                                                    ...prev,
                                                    aiCustomizationPreferences: {
                                                        ...prev.aiCustomizationPreferences!,
                                                        aiRecommendations: checked
                                                            ? [
                                                                  ...prev.aiCustomizationPreferences!
                                                                      .aiRecommendations,
                                                                  recommendation as AIRecommendation,
                                                              ]
                                                            : prev.aiCustomizationPreferences!.aiRecommendations.filter(
                                                                  (r) => r !== recommendation
                                                              ),
                                                    },
                                                }))
                                            }
                                        />
                                        <Label htmlFor={recommendation} className="cursor-pointer">
                                            {recommendation}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label>Automated Execution Preferences</Label>
                            <RadioGroup
                                value={
                                    preferences.aiCustomizationPreferences?.automatedExecutions ||
                                    ""
                                }
                                onValueChange={(value: "Yes" | "Mixed" | "No") =>
                                    setPreferences((prev: Partial<Preference>) => ({
                                        ...prev,
                                        aiCustomizationPreferences: {
                                            ...prev.aiCustomizationPreferences!,
                                            automatedExecutions: value || undefined,
                                        },
                                    }))
                                }
                            >
                                {[
                                    ["Yes", "I want automated executions"],
                                    ["Mixed", "Mix of automated and manual approval"],
                                    ["No", "Manual approval for all trades"],
                                ].map(([value, description]) => (
                                    <div key={value} className="flex items-center space-x-2">
                                        <RadioGroupItem value={value} id={value} />
                                        <Label htmlFor={value} className="cursor-pointer">
                                            {description}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>

                        <div className="pt-4 space-y-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="marketMovementAlerts"
                                    checked={
                                        preferences.aiCustomizationPreferences?.marketMovementAlerts
                                    }
                                    onCheckedChange={(checked: boolean) =>
                                        setPreferences((prev: Partial<Preference>) => ({
                                            ...prev,
                                            aiCustomizationPreferences: {
                                                ...prev.aiCustomizationPreferences!,
                                                marketMovementAlerts: checked,
                                            },
                                        }))
                                    }
                                />
                                <Label htmlFor="marketMovementAlerts" className="cursor-pointer">
                                    Receive alerts for major market movements
                                </Label>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogOverlay className="backdrop-blur-sm bg-transparent" />
            <DialogContent
                className={cn(
                    "sm:max-w-[500px]",
                    dialogState === "completion" && "animate-completion-pulse",
                    "max-h-[calc(100vh-5rem)]",
                    "bg-neutral-900/70",
                    "text-white",
                    "overflow-hidden",
                    "!rounded-3xl",
                    "flex flex-col",
                    "antialiased",
                    "mt-[5vh]",
                    "translate-y-0",
                    "top-0",
                    "border-0",
                    "focus:outline-none",
                    "focus:ring-0",
                    "focus:border-0",
                    "focus-within:outline-none",
                    "focus-within:ring-0",
                    "focus-within:border-0",
                    "focus-visible:outline-none",
                    "focus-visible:ring-0",
                    "focus-visible:border-0",
                    "select-none",
                    "transition-all duration-300 ease-out"
                )}
            >
                {dialogState === "completion" && (
                    <div
                        className={cn(
                            "absolute bottom-8 right-6",
                            "w-[100px] h-[40px]",
                            "bg-accent",
                            "origin-center",
                            "animate-completion-pulse",
                            "rounded-full",
                            "blur-md",
                            "z-[-10]"
                        )}
                    />
                )}

                {dialogState === "welcome" && (
                    <>
                        <DialogHeader className="flex items-center gap-4">
                            <div className="hover:rotate-[-12deg] transition-all duration-100 ease-out">
                                <img
                                    src="/logo-w.svg"
                                    alt="Welcome"
                                    className="my-4 w-24 h-24 animate-float "
                                    draggable={false}
                                />
                            </div>

                            <DialogTitle className="flex items-center gap-2 font-semibold font-bricolage">
                                Hi there!
                            </DialogTitle>
                            <DialogDescription className="text-base text-neutral-300 text-center text-pretty">
                                Let's customize your investment experience.
                                <br />
                                This quick questionnaire will help Crème'ai understand your:
                            </DialogDescription>
                            <ul className="text-base list-disc list-inside mt-2 space-y-1 text-neutral-300">
                                <li>Investment experience and goals</li>
                                <li>Risk tolerance and preferences</li>
                                <li>DeFi engagement level</li>
                                <li>AI assistance preferences</li>
                            </ul>
                        </DialogHeader>
                        <DialogFooter className="mt-8">
                            <Button
                                variant="main"
                                onClick={() => setDialogState("form")}
                                className="w-full"
                            >
                                Let's Get Started
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {dialogState === "completion" && (
                    <>
                        <DialogHeader className="flex items-center gap-4">
                            <div className="hover:rotate-[-12deg] transition-all duration-100 ease-out">
                                <img
                                    src="/logo-w.svg"
                                    alt="Welcome"
                                    className="my-4 w-24 h-24 animate-float "
                                    draggable={false}
                                />
                            </div>
                            <DialogTitle className="flex items-center gap-2">All Set!</DialogTitle>
                            <DialogDescription className="text-base text-neutral-300">
                                Thanks for completing your investor profile!
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-4">
                            <Button
                                variant="main"
                                onClick={() => {
                                    setDialogState("closed");
                                    onOpenChange(false);
                                }}
                                className="w-full"
                            >
                                Let's start building your portfolio!
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {dialogState === "form" && (
                    <>
                        <div className="flex-none">
                            <DialogHeader>
                                <DialogTitle className="">Investor Preferences</DialogTitle>
                            </DialogHeader>
                            <Stepper
                                steps={steps}
                                activeStep={activeStep}
                                progress={calculateStepCompletion(activeStep)}
                                className="px-0 py-2"
                                onStepClick={handleStepClick}
                            />
                        </div>
                        <div className="space-y-8 overflow-y-auto flex-1">
                            <div className="mt-4">{renderFormContent(activeStep)}</div>

                            <div className="flex justify-between mt-8">
                                {activeStep > 0 ? (
                                    <Button
                                        variant="main"
                                        onClick={handleBack}
                                        disabled={activeStep === 0}
                                        className="bg-slate-300/30 hover:bg-slate-300/50"
                                    >
                                        Back
                                    </Button>
                                ) : (
                                    <div />
                                )}
                                <Button
                                    variant="main"
                                    onClick={
                                        activeStep === steps.length - 1
                                            ? handlePreferencesSubmit
                                            : handleNext
                                    }
                                >
                                    {activeStep === steps.length - 1
                                        ? "Submit"
                                        : calculateStepCompletion(activeStep) <= 0.05
                                        ? "Skip"
                                        : "Next"}
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
