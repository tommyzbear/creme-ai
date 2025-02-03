import { JSONFilePreset } from 'lowdb/node'
import path from 'path'

interface ScamTokenDB {
    scamTokens: string[]
}

const defaultData: ScamTokenDB = {
    scamTokens: []
}

export const db = await JSONFilePreset<ScamTokenDB>(
    path.join(process.cwd(), 'data/scam-tokens.json'),
    defaultData
) 