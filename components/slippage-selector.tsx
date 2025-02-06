import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SlippageSelectorProps {
    className?: string;
    onSlippageChange?: (value: string) => void;
    presets?: string[];
    defaultValue?: string;
}

export function SlippageSelector({
    className,
    onSlippageChange,
    presets = ["0.1", "0.5", "1.0", "custom"],
    defaultValue = "0.5",
}: SlippageSelectorProps) {
    const [value, setValue] = useState(defaultValue);

    const handleChange = (newValue: string) => {
        setValue(newValue);
        onSlippageChange?.(newValue);
    };

    return (
        <div className={cn("flex flex-1 relative bg-slate-300/30 rounded-2xl p-0", className)}>
            {presets.map((preset) => (
                <Button
                    key={preset}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleChange(preset)}
                    className={cn(
                        "flex-1 relative z-10 transition-colors duration-200",
                        "hover:bg-transparent text-sm font-medium",
                        "focus-visible:ring-0 focus-visible:ring-offset-0",
                        value === preset && value !== "custom"
                            ? "text-white"
                            : "text-slate-300 hover:text-white"
                    )}
                >
                    {preset === "custom" ? preset : `${preset}%`}
                </Button>
            ))}
            <div
                className={cn(
                    "absolute inset-1 w-[calc(25%-6px)] transition-all duration-200 ease-out bg-accent rounded-xl",
                    value === "custom" && "opacity-0"
                )}
                style={{
                    left: `calc(${presets.indexOf(value) * 25}% + 3px)`,
                }}
            />
        </div>
    );
}
