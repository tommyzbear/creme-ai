import { JSONFilePreset } from 'lowdb/node'
import path from 'path'

interface ScamTokenDB {
    scamTokens: {
        [key: string]: string[]
    }
}

const defaultData: ScamTokenDB = {
    scamTokens: {
        "eth-mainnet": [],
        "arb-mainnet": []
    }
}

export const db = await JSONFilePreset<ScamTokenDB>(
    path.join(process.cwd(), 'data/scam-tokens.json'),
    defaultData
) 