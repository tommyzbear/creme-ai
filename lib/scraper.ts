import { TweetEntity } from "@/types/data";
import { Scraper, Tweet } from "@the-convocation/twitter-scraper"

const scraper = new Scraper()

await scraper.login(
    process.env.TWITTER_USERNAME!,
    process.env.TWITTER_PASSWORD!,
    process.env.TWITTER_EMAIL!,
    // process.env.TWITTER_TWO_FACTOR_SECRET!,
)

export const simplifyTweet = (tweet: Tweet | undefined): TweetEntity | undefined => tweet ? {
    id: tweet.id,
    username: tweet.username,
    userId: tweet.userId,
    timestamp: tweet.timestamp,
    timeParsed: tweet.timeParsed,
    bookmarkCount: tweet.bookmarkCount,
    likes: tweet.likes,
    replies: tweet.replies,
    retweets: tweet.retweets,
    views: tweet.views,
    text: tweet.isRetweet ? undefined : tweet.text,
    quotedTweet: tweet.isQuoted ? simplifyTweet(tweet.quotedStatus) : undefined,
    retweetedTweet: tweet.isRetweet ? simplifyTweet(tweet.retweetedStatus) : undefined
} as TweetEntity : undefined;

export default scraper