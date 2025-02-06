"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface SettingsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] h-[calc(100vh-10rem)] bg-slate-900 text-white border-slate-800">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold">
                        Trading Preferences
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Configure your trading parameters
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-8 py-4">
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Slippage Tolerance (%)</h3>
                        <div className="w-full p-3 rounded-lg bg-slate-800/50">
                            <span>1%</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Allowance</h3>
                        <RadioGroup defaultValue="exact" className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="exact" id="exact" />
                                <Label htmlFor="exact">Exact</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="unlimited" id="unlimited" />
                                <Label htmlFor="unlimited">Unlimited</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Gas Settings</h3>
                        <DialogDescription className="text-slate-400">
                            Manage your transaction gas preferences
                        </DialogDescription>
                        <div className="w-full p-3 rounded-lg bg-slate-800/50">
                            <span>Medium</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Automation Settings</h3>
                        <DialogDescription className="text-slate-400">
                            Configure your automated trading preferences
                        </DialogDescription>
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium">Risk Tolerance</h4>
                            <Slider
                                defaultValue={[10]}
                                max={100}
                                step={1}
                                className="[&_[role=slider]]:bg-purple-500"
                            />
                            <p className="text-sm text-slate-400">
                                Current: 10% (Higher value indicates higher risk tolerance)
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="sm:justify-between">
                    <Button
                        variant="outline"
                        className="bg-transparent border-slate-700 text-white hover:bg-slate-800"
                    >
                        Use Defaults
                    </Button>
                    <Button className="bg-white text-black hover:bg-slate-200">
                        Save Settings
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
