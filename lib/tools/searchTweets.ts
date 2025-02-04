import { z } from 'zod';
import { SearchTweetResult, searchTweets as searchTweetsService } from '@/lib/services/cookiedao';

export const searchTweets = {
    description: 'Search for tweets matching a given query, if no date range is provided, it will search for the last 7 days',
    parameters: z.object({
        searchQuery: z.string().describe('The query to search for'),
        from: z.string().describe('The start date to search from').default(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
        to: z.string().describe('The end date to search to').default(new Date().toISOString().split('T')[0])
    }),
    execute: async ({ searchQuery, from, to }: { searchQuery: string, from?: string, to?: string }) => {
        const tweets = await searchTweetsService(searchQuery, from, to)

        return tweets.ok?.map((tweet: SearchTweetResult) => ({
            text: tweet.text,
            date: tweet.createdAt,
            likes: tweet.likesCount,
            retweets: tweet.retweetsCount,
            author: tweet.authorUsername,
        }))
    }
}; 