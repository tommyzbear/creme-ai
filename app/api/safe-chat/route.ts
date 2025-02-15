import { safeSystemPrompt } from '@/lib/systemPrompt';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { privy } from '@/lib/privy';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    try {
        await privy.getClaims();

        const result = streamText({
            model: openai('gpt-4o-mini'),
            messages: [
                {
                    role: 'system',
                    content: safeSystemPrompt,
                },
                ...messages
            ],
            temperature: 0.1,
            tools: {
            },
            toolCallStreaming: true,
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