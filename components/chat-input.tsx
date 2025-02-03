import { SendHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface ChatInputProps {
    input: string
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
    handleSubmit: (e: React.FormEvent) => void
    isLoading: boolean
}

export function ChatInput({ input, handleInputChange, handleSubmit, isLoading }: ChatInputProps) {
    return (
        <form onSubmit={handleSubmit} className="flex gap-2">
            <Textarea
                className="flex-1 resize-none"
                placeholder="Type your message..."
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSubmit(e)
                    }
                }}
                rows={1}
            />
            <Button type="submit" size="icon" disabled={isLoading}>
                <SendHorizontal className="h-4 w-4" />
            </Button>
        </form>
    )
} 