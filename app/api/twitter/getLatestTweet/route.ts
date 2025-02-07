import { NextResponse } from "next/server"
import scraper, { simplifyTweet } from "@/lib/scraper"
import { TweetEntity } from "@/types/data"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
    // Add API key validation
    const apiKey = request.headers.get('x-api-key')
    if (!apiKey || apiKey !== process.env.API_KEY) {
        return NextResponse.json(
            { error: "Unauthorized - Invalid API key" },
            { status: 401 }
        )
    }

    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")
    const limit = searchParams.get("limit")
    const saveToDb = searchParams.get("saveToDb")

    if (!username) {
        return NextResponse.json(
            { error: "Username is required" },
            { status: 400 }
        )
    }

    try {
        const timeline = scraper.getTweets(username, limit ? parseInt(limit) : 20)
        const latestTweets: TweetEntity[] = []

        for await (const tweet of timeline) {
            const simplifiedTweet = simplifyTweet(tweet)
            if (simplifiedTweet) {
                latestTweets.push(simplifiedTweet)
            }
        }

        if (saveToDb) {
            await supabase.from("tweets").upsert(latestTweets.map(tweet => ({
                id: tweet.id,
                username: tweet.username,
                tweet: tweet,
                timestamp: tweet.timestamp
            })), { onConflict: "id" })
        }

        return NextResponse.json(latestTweets)
    } catch (error) {
        console.error('Error fetching tweets:', error)
        return NextResponse.json(
            { error: "Failed to fetch tweets" },
            { status: 500 }
        )
    }
}

