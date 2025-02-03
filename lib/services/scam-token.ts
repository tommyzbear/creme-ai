import { db } from '@/lib/db'

export async function addScamToken(address: string) {
    const scamTokens = db.data.scamTokens
    if (!scamTokens.includes(address)) {
        scamTokens.push(address)
        await db.write()
    }
}

export async function isScamToken(address: string): Promise<boolean> {
    return db.data.scamTokens.includes(address)
} 