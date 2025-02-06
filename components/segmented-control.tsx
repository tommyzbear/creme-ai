import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SegmentedControlProps {
    className?: string;
    onChange?: (value: string) => void;
    options?: string[];
    defaultValue?: string;
}

export function SegmentedControl({
    className,
    onChange,
    options = ["0.3", "1.0", "3.0", "5.0"],
    defaultValue = "1.0",
}: SegmentedControlProps) {
    const [value, setValue] = useState(defaultValue);

    const handleChange = (newValue: string) => {
        setValue(newValue);
        onChange?.(newValue);
    };

    return (
        <div className={cn("flex flex-1 relative bg-slate-300/30 rounded-2xl p-0", className)}>
            {options.map((option) => (
                <Button
                    key={option}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleChange(option)}
                    className={cn(
                        "flex-1 relative z-10 transition-colors duration-200",
                        "hover:bg-transparent text-sm font-medium",
                        "focus-visible:ring-0 focus-visible:ring-offset-0",
                        value === option && value !== "custom"
                            ? "text-white"
                            : "text-slate-300 hover:text-white"
                    )}
                >
                    {option === "custom" ? option : `${option}`}
                </Button>
            ))}
            <div
                className={cn(
                    "absolute inset-1 w-[calc(25%-6px)] transition-all duration-200 ease-out bg-accent rounded-xl",
                    value === "custom" && "opacity-0"
                )}
                style={{
                    left: `calc(${options.indexOf(value) * 25}% + 3px)`,
                }}
            />
        </div>
    );
}
