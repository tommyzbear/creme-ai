import { Bot, User } from "lucide-react"
import ReactMarkdown from "react-markdown"
import SyntaxHighlighter from "react-syntax-highlighter"
import { atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
interface ChatMessageProps {
    role: "user" | "assistant"
    content: string
}

export function ChatMessage({ role, content }: ChatMessageProps) {
    const isUser = role === "user"
    return (
        <>
            {content && <>
                {isUser ? (
                    <div className="flex gap-3 justify-end">
                        <div className={"flex-1 max-w-[80%] bg-primary p-4 rounded-lg"}>
                            <p className={"leading-relaxed text-primary-foreground"}>
                                {content}
                            </p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                            <User className="h-8 w-8 text-primary-foreground" />
                        </div>
                    </div>
                ) : (
                    <div className={"flex gap-3 justify-start"}>
                        <div className="h-10 w-10 rounded-full bg-muted/100 flex items-center justify-center shrink-0">
                            <Bot className="h-8 w-8 text-primary" />
                        </div>
                        <div className={"flex-1 max-w-[80%] bg-muted/100 p-4 rounded-lg prose"}>
                            <ReactMarkdown
                                components={{
                                    code({ node, inline, className, children, ...props }) {
                                        const match = /language-(\w+)/.exec(className || '')
                                        console.log("match", !inline && match)
                                        return !inline && match ? (
                                            <SyntaxHighlighter
                                                {...props}
                                                style={atomOneLight}
                                                language={match[1]}
                                                PreTag="div"
                                            >
                                                {String(children).replace(/\n$/, '')}
                                            </SyntaxHighlighter>
                                        ) : (
                                            <code {...props} className={className}>
                                                {children}
                                            </code>
                                        )
                                    },
                                    // Style tables
                                    table({ children }) {
                                        return (
                                            <div className="overflow-x-auto">
                                                <table className="w-full border-collapse border border-muted">
                                                    {children}
                                                </table>
                                            </div>
                                        )
                                    },
                                    th({ children }) {
                                        return (
                                            <th className="border border-muted bg-muted p-2 text-left">
                                                {children}
                                            </th>
                                        )
                                    },
                                    td({ children }) {
                                        return (
                                            <td className="border border-muted p-2">
                                                {children}
                                            </td>
                                        )
                                    },
                                }}
                            >
                                {content}
                            </ReactMarkdown>
                        </div>
                    </div>
                )}
            </>}
        </>
    )
} 