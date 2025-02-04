import { db } from '@/lib/db'

export async function addScamToken(address: string, chain: string) {
    const scamTokens = db.data.scamTokens
    if (!scamTokens[chain].includes(address)) {
        scamTokens[chain].push(address)
        await db.write()
    }
}

export async function isScamToken(address: string, chain: string): Promise<boolean> {
    return db.data.scamTokens[chain].includes(address)
} 