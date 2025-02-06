"use client";

import { useChat } from "ai/react";
import { useEffect, useRef, useState } from "react";
import { ChatMessage } from "@/components/chat-message";
import { ChatInput } from "@/components/chat-input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function ChatContainer({
    className,
    onFocus,
}: {
    className?: string;
    onFocus?: () => void;
}) {
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: "/api/chat",
        maxSteps: 5,
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
    const { toast } = useToast();
    const [showTopFade, setShowTopFade] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

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

                        {messages.map((message) => (
                            <ChatMessage
                                key={message.id}
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

            <div className="bottom-fade" />

            <div className="px-6 pt-2 pb-6 relative">
                <ChatInput
                    className="w-full"
                    input={input}
                    handleInputChange={handleInputChange}
                    handleSubmit={handleSubmit}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
}
