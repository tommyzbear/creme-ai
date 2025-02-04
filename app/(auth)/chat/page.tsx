"use client"

import { useChat } from "ai/react"
import { useEffect, useRef } from "react"
import { ChatMessage } from "@/components/chat-message"
import { ChatInput } from "@/components/chat-input"
import { useToast } from "@/hooks/use-toast"

export default function ChatPage() {
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: "/api/chat",
        maxSteps: 5,
        onError: (error) => {
            console.error('Chat error:', error)
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to process your request"
            })
        },
        onToolCall: (toolCall) => {
            console.log("toolCall", toolCall)
        }
    })
    const { toast } = useToast()

    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    return (
        <div className="flex flex-col h-[calc(100vh-2rem)]">
            <div className="flex-1 overflow-y-auto">
                <div className="h-full">
                    <div className="space-y-6 p-4">
                        {messages.length === 0 && (
                            <p className="text-center text-muted-foreground">
                                No messages yet. Start a conversation!
                            </p>
                        )}

                        {messages.map((message) => (
                            <ChatMessage
                                key={message.id}
                                role={message.role === "user" || message.role === "assistant" ? message.role : "assistant"}
                                content={message.content}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            </div>

            <div className="bg-background p-4">
                <div className="max-w-4xl mx-auto w-full">
                    <ChatInput
                        input={input}
                        handleInputChange={handleInputChange}
                        handleSubmit={handleSubmit}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </div>
    )
} 