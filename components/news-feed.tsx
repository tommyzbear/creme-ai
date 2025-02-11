import { format } from "date-fns";
import { NewsFeed as NewsFeedType, NewsItem } from "@/types/data";

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
        <div className="h-full overflow-y-auto">
            <div className="space-y-2 p-4">
                {news.map((item, index) => (
                    <div
                        key={index}
                        className="rounded-lg p-4 shadow-sm transition-colors hover:bg-accent/10"
                    >
                        <div className="flex items-start justify-between">
                            <p className="text-sm text-gray-800">{item.summary}</p>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                            <span>{item.sources}</span>
                            <time>{format(item.timestamp, "MMM d, yyyy HH:mm")}</time>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
