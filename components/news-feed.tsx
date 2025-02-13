import { format } from "date-fns";
import { formatDistanceToNow } from "date-fns";
import { NewsFeed as NewsFeedType, NewsItem } from "@/types/data";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

type NewsFeedProps = {
    news: NewsFeedType[] | NewsItem[];
    isLoading: boolean;
};

export function NewsFeed({ news, isLoading }: NewsFeedProps) {
    if (isLoading) {
        return (
            <div className="h-full overflow-y-auto">
                <div className="space-y-2 p-4">
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className="rounded-lg p-4 animate-pulse transition-colors">
                            <div className="flex items-start justify-between">
                                <div className="w-3/4 h-4 bg-muted-foreground/20 rounded animate-pulse" />
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                                <div className="w-1/4 h-3 bg-muted-foreground/20 rounded animate-pulse" />
                                <div className="w-1/4 h-3 bg-muted-foreground/20 rounded animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <TooltipProvider>
            <div className="h-full overflow-y-auto">
                <div className="space-y-2 p-4">
                    {news.map((item, index) => (
                        <div
                            key={index}
                            className="rounded-2xl p-4 transition-colors hover:bg-accent/10"
                        >
                            <div className="flex items-start justify-between">
                                <p className="text-sm text-neutral-900">{item.summary}</p>
                            </div>
                            <div className="mt-2 flex flex-col items-left justify-between text-xs text-neutral-700">
                                <span>Summarised from {item.sources}</span>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger asChild>
                                        <time className="cursor-pointer transition-all duration-200 hover:underline">
                                            {formatDistanceToNow(item.timestamp, {
                                                addSuffix: true,
                                            })}
                                        </time>
                                    </TooltipTrigger>
                                    <TooltipContent
                                        className="p-1"
                                        side="bottom"
                                        align="start"
                                        alignOffset={-4}
                                    >
                                        <p className="text-xs tracking-tight">
                                            {format(item.timestamp, "HH:mm, MMM d, yyyy")}
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </TooltipProvider>
    );
}
