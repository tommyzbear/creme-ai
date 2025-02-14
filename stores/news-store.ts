import { create } from "zustand";
import { NewsItem } from "@/types/data";

interface NewsStore {
    news: NewsItem[];
    isLoading: boolean;
    setNews: (news: NewsItem[]) => void;
    fetchNews: () => Promise<void>;
}

export const useNewsStore = create<NewsStore>((set) => ({
    news: [],
    isLoading: false,
    setNews: (news) => set({ news }),
    fetchNews: async () => {
        try {
            set({ isLoading: true });
            const response = await fetch("/api/news");
            const news = await response.json();
            console.log(news);
            set({ news, isLoading: false });
        } catch (error) {
            console.error("Error fetching news:", error);
            set({ isLoading: false });
            throw error;
        }
    },
})); 