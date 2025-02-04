"use client";

import { useChat } from "ai/react";
import { useEffect, useRef } from "react";
import { ChatMessage } from "@/components/chat-message";
import { ChatInput } from "@/components/chat-input";

export function ChatContainer({
    className,
    onFocus,
}: {
    className?: string;
    onFocus?: () => void;
}) {
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: "/api/chat",
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
            <div className="flex-1 overflow-y-auto">
                <div className="h-full">
                    <div className="space-y-6 p-4">
                        {messages.length === 0 && (
                            <p className="text-center text-base select-none">
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

            <div className="p-6 relative">
                <div className="w-full">
                    <ChatInput
                        input={input}
                        handleInputChange={handleInputChange}
                        handleSubmit={handleSubmit}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </div>
    );
}
