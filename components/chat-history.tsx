import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useChatStore } from "@/stores/chat-store";

interface ChatHistoryProps {
    onSelectSession: (sessionId: string) => void;
    currentSessionId: string;
}

export function ChatHistory({ onSelectSession, currentSessionId }: ChatHistoryProps) {
    const { isLoading, sessions } = useChatStore();

    if (isLoading) {
        return (
            <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="h-12 bg-muted animate-pulse rounded-lg"
                    />
                ))}
            </div>
        );
    }

    return (
        <ScrollArea className="h-full">
            <div className="space-y-2 pr-4">
                {sessions.map((session) => (
                    <button
                        key={session.session_id}
                        onClick={() => onSelectSession(session.session_id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                            ${session.session_id === currentSessionId
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-muted"
                            }`}
                    >
                        <MessageSquare className="h-4 w-4" />
                        <div className="flex-1 text-left truncate">
                            <div className="font-medium">{session.session_name}</div>
                            <div className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(session.timestamp), { addSuffix: true })}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </ScrollArea>
    );
} 