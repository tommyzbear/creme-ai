const COOKIE_DAO_API_KEY = process.env.COOKIE_DAO_API_KEY
const API_BASE_URL = 'https://api.cookie.fun'

interface Contract {
    chain: number
    contractAddress: string
}

interface TopTweet {
    tweetUrl: string
    tweetAuthorProfileImageUrl: string
    tweetAuthorDisplayName: string
    smartEngagementPoints: number
    impressionsCount: number
}

export interface AgentData {
    agentName: string
    contracts: Contract[]
    twitterUsernames: string[]
    mindshare: number
    mindshareDeltaPercent: number
    marketCap: number
    marketCapDeltaPercent: number
    price: number
    priceDeltaPercent: number
    liquidity: number
    volume24Hours: number
    volume24HoursDeltaPercent: number
    holdersCount: number
    holdersCountDeltaPercent: number
    averageImpressionsCount: number
    averageImpressionsCountDeltaPercent: number
    averageEngagementsCount: number
    averageEngagementsCountDeltaPercent: number
    followersCount: number
    smartFollowersCount: number
    topTweets: TopTweet[]
}

interface CookieResponse<T> {
    ok: T | null
    success: boolean
    error: string | null
}

type Interval = '_7Days' | '_3Days'

interface PagedAgentData {
    data: AgentData[]
    currentPage: number
    totalPages: number
    totalCount: number
}

export interface SearchTweetResult {
    authorUsername: string
    createdAt: string
    engagementsCount: number
    impressionsCount: number
    isQuote: boolean
    isReply: boolean
    likesCount: number
    quotesCount: number
    repliesCount: number
    retweetsCount: number
    smartEngagementPoints: number
    text: string
    matchingScore: number
}

function validatePageParams(page: number, pageSize: number): void {
    if (page < 1) {
        throw new Error('Page number must be greater than 0')
    }
    if (pageSize < 1 || pageSize > 100) {
        throw new Error('Page size must be between 1 and 100')
    }
}

export async function getAgentByTwitter(
    twitterUsername: string,
    interval: Interval = '_3Days'
): Promise<CookieResponse<AgentData>> {
    try {
        const response = await fetch(
            `${API_BASE_URL}/v2/agents/twitterUsername/${twitterUsername}?interval=${interval}`, {
            headers: {
                'x-api-key': COOKIE_DAO_API_KEY
            }
        }
        )

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error fetching agent data:', error)
        return {
            ok: null,
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch agent data'
        }
    }
}

export async function getAgentByContract(
    contractAddress: string,
    interval: Interval = '_3Days'
): Promise<CookieResponse<AgentData>> {
    try {
        const response = await fetch(
            `${API_BASE_URL}/v2/agents/contractAddress/${contractAddress}?interval=${interval}`, {
            headers: {
                'x-api-key': COOKIE_DAO_API_KEY
            }
        }
        )

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error fetching agent data:', error)
        return {
            ok: null,
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch agent data'
        }
    }
}

export async function getAgentsPaged(
    interval: Interval = '_7Days',
    page: number = 1,
    pageSize: number = 10,
    withTweets: boolean = false
): Promise<CookieResponse<PagedAgentData>> {
    try {
        validatePageParams(page, pageSize)

        const response = await fetch(
            `${API_BASE_URL}/v2/agents/agentsPaged?interval=${interval}&page=${page}&pageSize=${pageSize}`, {
            headers: {
                'x-api-key': COOKIE_DAO_API_KEY
            }
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (!withTweets) {
            data.ok.data = data.ok?.data.map((agent: AgentData) => ({
                ...agent,
                topTweets: undefined
            }))
        }

        return data
    } catch (error) {
        console.error('Error fetching paged agents:', error)
        return {
            ok: null,
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch paged agents'
        }
    }
}

export async function searchTweets(
    searchQuery: string,
    from?: string,
    to?: string
): Promise<CookieResponse<SearchTweetResult[]>> {
    try {
        const url = `${API_BASE_URL}/v1/hackathon/search/${encodeURIComponent(searchQuery)}?from=${from}&to=${to}`
        console.log("url", url)

        const response = await fetch(url, {
            headers: {
                'x-api-key': COOKIE_DAO_API_KEY
            }
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error searching hackathon:', error)
        return {
            ok: null,
            success: false,
            error: error instanceof Error ? error.message : 'Failed to search hackathon'
        }
    }
}
