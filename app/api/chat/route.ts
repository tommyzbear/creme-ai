import { systemPrompt } from '@/lib/systemPrompt';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { formattedTools } from '@/lib/tools/toolRunner';
import { z } from 'zod';
import { getPairsMatchingQuery } from '@/lib/services/dexscreener';
import { TweetEntity } from '@/types/data';
import { simplifyTweet } from '@/lib/scraper';
import scraper from '@/lib/scraper';
import { getAgentByTwitter, SearchTweetResult, searchTweets } from '@/lib/services/cookiedao';
import { AuthError } from '@supabase/supabase-js';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    try {
        const result = streamText({
            model: openai('gpt-4o-mini'),
            messages: [
                {
                    role: 'system',
                    content: systemPrompt,
                },
                ...messages
            ],
            temperature: 0.1,
            tools: {
                // Define the tool directly in the streamText call
                getTokenPrice: {
                    description: 'Get the current price and trading information for a token',
                    parameters: z.object({
                        token: z.string().describe('The token symbol or name to search for')
                    }),
                    execute: async ({ token }: { token: string }) => {
                        try {
                            const pairs = await getPairsMatchingQuery(token)

                            if (pairs.length === 0) {
                                return `No pairs found for token ${token}`;
                            }

                            // Sort pairs by liquidity (highest first)
                            const sortedPairs = pairs.sort((a, b) => {
                                const liquidityA = Number(a.liquidity?.usd || 0);
                                const liquidityB = Number(b.liquidity?.usd || 0);
                                return liquidityB - liquidityA;
                            });

                            const pair = sortedPairs[0];
                            return {
                                token: pair.baseToken.symbol,
                                price: pair.priceUsd,
                                priceChange24hPercentage: pair.priceChange?.h24,
                                volume24h: pair.volume?.h24,
                                buys24h: pair.txns?.h24?.buys,
                                sells24h: pair.txns?.h24?.sells,
                                dex: pair.dexId,
                                chain: pair.chainId
                            };
                        } catch (error) {
                            console.error('DexScreener API error:', error);
                            throw new Error('Failed to fetch token price');
                        }
                    }
                },
                getKolActivity: {
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
                },
                searchTweets: {
                    description: 'Search for tweets matching a given query, if no date range is provided, it will search for the last 7 days',
                    parameters: z.object({
                        searchQuery: z.string().describe('The query to search for'),
                        from: z.string().describe('The start date to search from').default(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
                        to: z.string().describe('The end date to search to').default(new Date().toISOString().split('T')[0])
                    }),
                    execute: async ({ searchQuery, from, to }: { searchQuery: string, from?: string, to?: string }) => {
                        const tweets = await searchTweets(searchQuery, from, to)
                        console.log("searchQuery", searchQuery, from, to)
                        console.log("tweets ok", tweets.ok)


                        return tweets.ok.map((tweet: SearchTweetResult) => ({
                            text: tweet.text,
                            date: tweet.createdAt,
                            likes: tweet.likesCount,
                            retweets: tweet.retweetsCount,
                            author: tweet.authorUsername,
                        }))
                    }
                },
                getAgentByTwitter: {
                    description: 'Get the agent data for a given Twitter/X username',
                    parameters: z.object({
                        username: z.string().describe('The Twitter/X username to fetch agent data for')
                    }),
                    execute: async ({ username }: { username: string }) => {
                        const agent = await getAgentByTwitter(username)
                        return agent
                    }
                }
            },
            experimental_toolCallStreaming: true,
        });

        return result.toDataStreamResponse({
            getErrorMessage: (error) => {
                console.error('Streaming error:', error);
                if (error instanceof Error) {
                    return error.message;
                }
                return 'An error occurred while processing your request';
            }
        });
    } catch (error) {
        console.error('Error in POST route:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
} 