"use client";

import { Message, useChat } from "ai/react";
import { useEffect, useRef, useState } from "react";
import { ChatMessage } from "@/components/chat-message";
import { ChatInput } from "@/components/chat-input";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSafeChatStore } from "@/stores/safe-chat-store";

export function SafeChatContainer({
    className,
    onFocus,
    sessionName,
    setSessionName,
    startNewChat,
}: {
    className?: string;
    onFocus?: () => void;
    sessionName: string;
    setSessionName: (name: string) => void;
    startNewChat: () => void;
}) {
    const { toast } = useToast();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { sessionId, addSession } = useSafeChatStore();

    const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
        api: "/api/safe-chat",
        maxSteps: 5,
        id: sessionId,
        onFinish: async (message) => {
            try {
                await fetch("/api/safe-chat/message", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        session_id: sessionId,
                        session_name: sessionName,
                        role: "assistant",
                        content: message,
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

    useEffect(() => {
        const fetchMessages = async () => {
            console.log("sessionId", sessionId);
            try {
                const response = await fetch(`/api/safe-chat/sessions/${sessionId}`);
                if (!response.ok) throw new Error("Failed to fetch session messages");
                const messages = await response.json();
                setMessages(messages);
            } catch (error) {
                console.error("Error fetching session messages:", error);
            }
        };
        fetchMessages();
    }, [sessionId, setMessages]);

    const [showTopFade, setShowTopFade] = useState(false);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    const handleMessageSubmit = async (e: React.FormEvent<Element>) => {
        e.preventDefault();
        const currentSessionName = sessionName === "" ? input.substring(0, 35) : "";

        // first message
        if (sessionName === "") {
            setSessionName(input.substring(0, 35));
            addSession(sessionId, currentSessionName);
        }

        try {
            await fetch("/api/safe-chat/message", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    session_id: sessionId,
                    session_name: currentSessionName,
                    role: "user",
                    content: {
                        role: "user",
                        content: input,
                    } as Message,
                }),
            });
        } catch (error) {
            console.error(`Failed to save user message:`, error);
        }

        // Process the message
        handleSubmit(e);
    };

    const scrollToBottom = () => {
        const messagesContainer = messagesEndRef.current?.parentElement;
        if (messagesContainer) {
            const isScrolledToBottom =
                Math.abs(
                    messagesContainer.scrollHeight -
                    messagesContainer.scrollTop -
                    messagesContainer.clientHeight
                ) < 10;

            if (isScrolledToBottom) {
                messagesEndRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "end",
                });
            }
        }
    };

    const handleScroll = () => {
        if (messagesContainerRef.current) {
            setShowTopFade(messagesContainerRef.current.scrollTop > 0);
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div
            className={`flex flex-col h-full overflow-hidden ${className}`}
            onFocus={onFocus}
            tabIndex={0}
        >
            {showTopFade && (
                <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-background/30 to-transparent z-10 pointer-events-none" />
            )}
            <div
                className="flex-1 overflow-y-auto"
                ref={messagesContainerRef}
                onScroll={handleScroll}
            >
                <div className="h-full">
                    <div className="space-y-6 p-6">
                        {messages.length === 0 && (
                            <p className="text-center text-base text-muted-foreground select-none">
                                No messages yet. Start a conversation!
                            </p>
                        )}

                        {messages.map((message, index) => (
                            <ChatMessage
                                key={message.id ?? index}
                                role={
                                    message.role === "user" || message.role === "assistant"
                                        ? message.role
                                        : "assistant"
                                }
                                content={message.content}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            </div>

            <div className="bottom-fade z-[-5]" />

            <div className="px-6 pt-2 pb-6 relative">
                <div className="flex flex-row gap-2 justify-center items-center min-h-[40px]">
                    <TooltipProvider>
                        <Tooltip delayDuration={200}>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    onClick={startNewChat}
                                    className="rounded-full h-10 w-11 hover:bg-ai"
                                >
                                    <Plus className="w-5 h-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-sm">New Chat</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <ChatInput
                        className="w-full"
                        input={input}
                        handleInputChange={handleInputChange}
                        handleSubmit={async (e: React.FormEvent<Element>) =>
                            await handleMessageSubmit(e)
                        }
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </div>
    );
}
