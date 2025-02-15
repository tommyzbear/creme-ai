import { cn } from "@/lib/utils";
import { Circle } from "lucide-react";

interface StepperProps {
    steps: string[];
    activeStep: number;
    progress: number;
    className?: string;
    onStepClick?: (step: number) => void;
}

export function Stepper({ steps, activeStep, progress, className, onStepClick }: StepperProps) {
    return (
        <div className="flex flex-col gap-0 mt-4">
            <div className={cn("flex w-full gap-2", className)}>
                {steps.map((step, index) => (
                    <button
                        key={step}
                        onClick={() => index < activeStep && onStepClick?.(index)}
                        className={cn(
                            "h-2 rounded-full transition-all duration-300 ease-out relative border-0 focus:outline-none focus:ring-0 antialiased",
                            index === activeStep
                                ? "flex-1 bg-neutral-300/30 overflow-hidden"
                                : index < activeStep
                                ? "w-8 bg-white hover:opacity-80 cursor-pointer"
                                : "w-8 bg-neutral-300/30"
                        )}
                        disabled={index >= activeStep}
                        title={index < activeStep ? `Go back to "${step}"` : undefined}
                    >
                        {index === activeStep && (
                            <div
                                className="antialiased absolute border-0 ring-0 focus:outline-none focus:ring-0 h-full top-0 left-0 w-full bg-white rounded-full transition-transform duration-300 ease-out origin-left"
                                style={{ transform: `scaleX(${progress})` }}
                            />
                        )}
                    </button>
                ))}
            </div>
            <div className="flex justify-start items-center gap-2">
                {/* <div className="w-5 h-5 bg-neutral-300/30 rounded-full text-center items-center text-white text-sm font-semibold">
                    {activeStep + 1}
                </div> */}
                <h1 className="text-md font-medium font-bricolage">
                    Q.{activeStep + 1}: {steps[activeStep]}
                </h1>
            </div>
        </div>
    );
}
