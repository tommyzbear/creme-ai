import { StakeKitClient } from './stakeKit'
import fs from 'fs'
//import { ethers } from 'ethers'
//import { createSafe } from './safe'
async function runTests() {
  const client = new StakeKitClient({
    apiKey: process.env.STAKEKIT_API_KEY || '',
    network: 'arbitrum'
  })

  const tokens = await client.getEnabledTokens(['arbitrum', 'base','optimism','ethereum'])
  fs.writeFileSync('tokensNames.json', JSON.stringify(tokens, null, 2))
  console.log(tokens)
}

// Execute the tests
runTests().catch(console.error)

