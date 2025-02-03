"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { TweetEntity } from "@/types/data"

export default function TwitterAdminPage() {
    const [username, setUsername] = useState("")
    const [limit, setLimit] = useState(20)
    const [tweets, setTweets] = useState<TweetEntity[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const fetchTweets = async (saveToDb: boolean = false) => {
        if (!username) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Please enter a username"
            })
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch(`/api/twitter/getLatestTweet?username=${encodeURIComponent(username)}&limit=${limit}&saveToDb=${saveToDb}`)
            if (!response.ok) {
                throw new Error('Failed to fetch tweets')
            }
            const latestTweets = await response.json()
            setTweets(latestTweets)
        } catch (error) {
            console.error('Error fetching tweets:', error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to fetch tweets"
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <Card className="p-6">
                <div className="flex gap-4">
                    <Input
                        placeholder="Enter Twitter username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="max-w-xs"
                    />
                    <Input
                        placeholder="Enter number of tweets to fetch"
                        value={limit}
                        type="number"
                        onChange={(e) => setLimit(parseInt(e.target.value))}
                        className="max-w-xs"
                    />
                    <Button
                        onClick={() => fetchTweets(false)}
                        disabled={isLoading}
                    >
                        {isLoading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Fetch Latest Tweets
                    </Button>
                    <Button
                        onClick={() => fetchTweets(true)}
                        disabled={isLoading}
                    >
                        {isLoading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Save Tweets to DB
                    </Button>
                </div>
            </Card>

            <div className="space-y-4">
                {tweets.map((tweet) => (
                    <Card key={tweet.id} className="p-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">{tweet.username}</span>
                                <span className="text-muted-foreground">
                                    {tweet.timeParsed ? tweet.timeParsed.toLocaleString('en-US', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit',
                                        hour12: false
                                    }).replace(',', '') : "N/A"}
                                </span>
                            </div>
                            <p className="text-sm">{tweet.text}</p>

                            {/* Display Quoted Tweet if it exists */}
                            {tweet.quotedTweet && (
                                <div className="mt-2 border rounded-lg p-4 bg-muted/30">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">{tweet.quotedTweet.username}</span>
                                        <span className="text-muted-foreground">
                                            {tweet.quotedTweet.timeParsed ? tweet.quotedTweet.timeParsed.toLocaleString('en-US', {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit',
                                                hour12: false
                                            }).replace(',', '') : "N/A"}
                                        </span>
                                    </div>
                                    <p className="text-sm">{tweet.quotedTweet.text}</p>

                                    <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                                        <span>{tweet.likes} likes</span>
                                        <span>{tweet.retweets} retweets</span>
                                        <span>{tweet.replies} replies</span>
                                    </div>
                                </div>
                            )}

                            {/* Display Retweeted Tweet if it exists */}
                            {tweet.retweetedTweet && (
                                <div className="mt-2 border rounded-lg p-4 bg-muted/30">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">{tweet.retweetedTweet.username}</span>
                                        <span className="text-muted-foreground">
                                            {tweet.retweetedTweet.timeParsed ? tweet.retweetedTweet.timeParsed.toLocaleString('en-US', {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit',
                                                hour12: false
                                            }).replace(',', '') : "N/A"}
                                        </span>
                                    </div>
                                    <p className="text-sm">{tweet.retweetedTweet.text}</p>

                                    <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                                        <span>{tweet.likes} likes</span>
                                        <span>{tweet.retweets} retweets</span>
                                        <span>{tweet.replies} replies</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4 text-sm text-muted-foreground">
                                <span>{tweet.likes} likes</span>
                                <span>{tweet.retweets} retweets</span>
                                <span>{tweet.replies} replies</span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
} 