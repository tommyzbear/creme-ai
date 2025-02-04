import { z } from 'zod';
import { getAgentByTwitter as getAgentByTwitterService } from '@/lib/services/cookiedao';

export const getAgentByTwitter = {
    description: 'Get the agent data for a given Twitter/X username',
    parameters: z.object({
        username: z.string().describe('The Twitter/X username to fetch agent data for')
    }),
    execute: async ({ username }: { username: string }) => {
        const agent = await getAgentByTwitterService(username)
        return agent
    }
}; 