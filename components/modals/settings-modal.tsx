"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogOverlay,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { SegmentedControl } from "@/components/ui/segmented-control";

interface SettingsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogOverlay className="backdrop-blur-sm bg-transparent" />
            <DialogContent
                className={cn(
                    "sm:max-w-[500px]",
                    "max-h-[calc(100vh-10rem)]",
                    "bg-neutral-900/70",
                    "text-white",
                    "overflow-y-auto",
                    "!rounded-3xl"
                )}
            >
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">
                        Transaction Preferences
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-12 py-4">
                    <div className="space-y-4">
                        <h3 className="text-base font-medium">Slippage Tolerance (%)</h3>
                        <SegmentedControl
                            className="flex"
                            options={["0.3", "1.0", "3.0", "5.0"]}
                            defaultValue="1.0"
                            onChange={(value) => console.log("Slippage:", value)}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-col gap-0">
                            <h4 className="text-base font-medium">Transaction Allowance</h4>
                            <DialogDescription className="text-sm font-light text-slate-400">
                                Approval for token spending
                            </DialogDescription>
                        </div>

                        <RadioGroup
                            defaultValue="exact"
                            className="flex flex-row justify-start gap-6 items-center"
                        >
                            <div className="flex items-center space-x-2 text-sm">
                                <RadioGroupItem value="exact" id="exact" className="" />
                                <Label htmlFor="exact">Exact</Label>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                                <RadioGroupItem value="unlimited" id="unlimited" className="" />
                                <Label htmlFor="unlimited">Unlimited</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Gas Settings */}
                    <div className="space-y-4">
                        <div className="flex flex-col gap-0">
                            <h4 className="text-base font-medium">Gas Settings</h4>
                            <DialogDescription className="text-sm font-light text-slate-400">
                                Manage your transaction gas preferences
                            </DialogDescription>
                        </div>
                        <SegmentedControl
                            className="flex"
                            options={["Slow", "Medium", "Fast", "Ape"]}
                            defaultValue="Medium"
                            onChange={(value) => console.log("Gas setting:", value)}
                        />
                    </div>

                    {/* Risk Settings */}
                    {/* <div className="space-y-4">
                        <h3 className="text-lg font-medium">Risk Settings</h3>
                        <DialogDescription className="text-slate-400">
                            Configure your risk preferences
                        </DialogDescription>
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium">Risk Tolerance</h4>
                            <Slider
                                defaultValue={[10]}
                                max={100}
                                step={1}
                                className="[&_[role=slider]]:bg-accent stroke-none stroke-0"
                            />
                            <p className="text-sm text-slate-400">
                                Current: 10% (Higher value indicates higher risk tolerance)
                            </p>
                        </div>
                    </div> */}
                </div>

                <DialogFooter className="sm:justify-between">
                    <Button variant="main" className="bg-slate-300/30 hover:bg-slate-300/50">
                        Use Defaults
                    </Button>
                    <Button variant="main">Save Settings</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
