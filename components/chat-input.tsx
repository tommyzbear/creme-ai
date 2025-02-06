import { SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
interface ChatInputProps {
    className?: string;
    input: string;
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    handleSubmit: (e: React.FormEvent) => void;
    isLoading: boolean;
}

export function ChatInput({
    className,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
}: ChatInputProps) {
    return (
        <form
            onSubmit={handleSubmit}
            className={cn("flex gap-2 items-center justify-center", className)}
        >
            <Textarea
                className="flex-1 resize-none bg-white/60 rounded-2xl text-left text-pretty py-3 h-auto min-h-[40px] focus:shadow-sm transition-shadow duration-200"
                placeholder="Type your message..."
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                    }
                }}
                rows={1}
            />
            <Button
                className="hover:bg-accent transition-colors duration-300 h-10 w-10 rounded-xl"
                type="submit"
                size="icon"
                disabled={isLoading}
            >
                <SendHorizontal className="h-4 w-4" />
            </Button>
        </form>
    );
}
