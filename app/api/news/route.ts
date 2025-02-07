import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { privyClient } from '@/lib/privy';
import { cookies } from 'next/headers';
import { openai } from '@/lib/services/openai';
import { TweetDbEntity } from '@/types/data';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const cookieAuthToken = cookieStore.get("privy-token");

        if (!cookieAuthToken) {
            throw new Error('Unauthorized');
        }

        const claims = await privyClient.verifyAuthToken(cookieAuthToken.value);

        if (!claims) {
            throw new Error('Unauthorized');
        }

        const { data, error } = await supabase
            .from('news_feed')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(10)

        if (error) throw error;

        return NextResponse.json(data.map((item) => ({
            summary: item.summary,
            sources: item.sources,
            timestamp: item.timestamp
        })))
    } catch (error) {
        console.error('Error fetching tweets:', error)
        return NextResponse.json(
            { error: 'Failed to fetch tweets' },
            { status: 500 }
        )
    }
}


export async function POST(request: Request) {
    // Add API key validation
    const apiKey = request.headers.get('x-api-key')
    if (!apiKey || apiKey !== process.env.API_KEY) {
        return NextResponse.json(
            { error: "Unauthorized - Invalid API key" },
            { status: 401 }
        )
    }

    try {
        const { data, error } = await supabase
            .from('tweets')
            .select('*')
            .gte('timestamp', Math.floor(Date.now() / 1000) - (60 * 60 * 24))
            .order('timestamp', { ascending: false })

        if (error) throw error;

        const tweets = (data as TweetDbEntity[]).map(tweet => tweet.tweet)

        const formattedInput = tweets.map((tweet, index) =>
            `${index + 1}. ${tweet.text ?
                tweet.quotedTweet ?
                    tweet.quotedTweet.text : tweet.retweetedTweet ?
                        tweet.retweetedTweet.text :
                        tweet.text :
                tweet.text} (Sources: ${tweet.username}, Timestamp: ${tweet.timestamp})`
        ).join("\n\n");

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Summarize the following tweets into 10 key points. Keep each summary concise and provide a comma-separated list of sources and a timestamp for each summary." },
                { role: "user", content: formattedInput }
            ],
            temperature: 0.5,
        });

        const summaryText = response.choices[0].message.content;

        const summaryArray = summaryText ? summaryText.split("\n").map((line) => {
            const match = line.match(/^(\d+)\.\s*(.*?)\s*\(Sources:\s*(.*?)\s*,\s*Timestamp:\s*(.*?)\)$/);
            return match ? {
                summary: match[2],
                sources: match[3],
                timestamp: new Date(Number(match[4]) * 1000)
            } : null;
        }).filter(Boolean) : [];


        const { data: newsData, error: newsError } = await supabase
            .from('news_feed')
            .insert(summaryArray)
            .select()

        if (newsError) throw newsError;

        return NextResponse.json(newsData)
    } catch (error) {
        console.error('Error fetching tweets:', error)
        return NextResponse.json(
            { error: 'Failed to fetch tweets' },
            { status: 500 }
        )
    }
}