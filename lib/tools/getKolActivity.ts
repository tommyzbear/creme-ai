import { z } from 'zod';
import { TweetEntity } from '@/types/data';
import { simplifyTweet } from '@/lib/scraper';
import scraper from '@/lib/scraper';

export const getKolActivity = {
    description: 'Get and summarize recent Twitter/X activity for a given user',
    parameters: z.object({
        username: z.string().describe('The Twitter/X username to fetch activity for')
    }),
    execute: async ({ username }: { username: string }) => {
        try {
            console.log("fetching tweets for", username)
            const timeline = scraper.getTweets(username, 20)
            console.log("timeline", timeline)
            const latestTweets: TweetEntity[] = []

            for await (const tweet of timeline) {
                const simplifiedTweet = simplifyTweet(tweet)
                if (simplifiedTweet) {
                    latestTweets.push(simplifiedTweet)
                }
            }

            console.log("latestTweets", latestTweets)

            return {
                username,
                tweetCount: latestTweets.length,
                tweets: latestTweets.map((tweet: TweetEntity) => ({
                    text: tweet.text,
                    date: tweet.timestamp,
                    likes: tweet.likes,
                    retweets: tweet.retweets
                }))
            };
        } catch (error) {
            console.error('Twitter API error:', error);
            throw new Error('Failed to fetch Twitter activity');
        }
    }
}; 