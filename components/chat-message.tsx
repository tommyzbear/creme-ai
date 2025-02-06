import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { markdownComponents } from "./markdown-components";

interface ChatMessageProps {
    role: "user" | "assistant";
    content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
    const isUser = role === "user";
    return (
        <>
            {content && (
                <>
                    {isUser ? (
                        <div className="flex gap-3 justify-end">
                            <div className="max-w-[70%] bg-primary p-3 rounded-2xl relative">
                                <div className="absolute antialiased bottom-0 right-[14px] translate-x-1/2 translate-y-[14.5px] rotate-[135deg] w-0 h-0 border-[15px] border-transparent border-l-primary" />
                                <p className="w-full text-sm not-italic leading-relaxed text-primary-foreground">
                                    {content}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className={"flex gap-3 justify-start"}>
                            <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 frosted-glass bg-background/70 hover:none shadow-md">
                                <Bot className="h-8 w-8 text-primary" />
                            </div>
                            <div
                                className={
                                    "flex-1 max-w-[70%] p-3 pl-4 rounded-2xl text-base frosted-glass bg-background/50 hover:none shadow-md"
                                }
                            >
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={markdownComponents}
                                >
                                    {content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    )}
                </>
            )}
        </>
    );
}
