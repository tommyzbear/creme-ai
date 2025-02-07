import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useChatStore } from "@/stores/chat-store";
import { forwardRef } from "react";

interface ChatHistoryProps {
    onSelectSession: (sessionId: string) => void;
    currentSessionId: string;
}

export const ChatHistory = forwardRef<HTMLDivElement, ChatHistoryProps>(
    ({ onSelectSession, currentSessionId }, ref) => {
        const { isLoading, sessions } = useChatStore();

        if (isLoading) {
            return (
                <div className="space-y-2 p-4">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-2xl bg-muted animate-pulse"
                        >
                            <div className="h-4 w-4 bg-muted-foreground/20 rounded" />
                            <div className="flex-1">
                                <div className="h-4 w-24 bg-muted-foreground/20 rounded mb-1" />
                                <div className="h-2 w-16 bg-muted-foreground/20 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <div className="h-full overflow-y-auto" ref={ref}>
                <div className="space-y-2 p-4">
                    {sessions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                            <MessageSquare className="h-5 w-5 mb-2 opacity-50" />
                            <p className="text-sm">No chat history yet</p>
                        </div>
                    ) : (
                        sessions.map((session) => (
                            <button
                                key={session.session_id}
                                onClick={() => onSelectSession(session.session_id)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-sm transition-colors
                                ${
                                    session.session_id === currentSessionId
                                        ? "bg-gradient-to-r bg-white/70 shadow-md text-black"
                                        : "hover:bg-neutral-500/50 "
                                }`}
                            >
                                <MessageSquare className="h-4 w-4" />
                                <div className="flex-1 text-left truncate ">
                                    <div className="font-medium">{session.session_name}</div>
                                    <div className="text-[.55rem] font-medium">
                                        {formatDistanceToNow(new Date(session.timestamp), {
                                            addSuffix: true,
                                        })}
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>
        );
    }
);

ChatHistory.displayName = "ChatHistory";
