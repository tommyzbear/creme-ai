import { StakeKitClient } from './stakeKit'
//import fs from 'fs'
//import { ethers } from 'ethers'
////import { createSafe } from './safe'
async function runTests() {
  const client = new StakeKitClient({
    apiKey: process.env.STAKEKIT_API_KEY || '',
    network: 'arbitrum'
  })

  //const provider = new ethers.JsonRpcProvider('https://arb1.arbitrum.io/rpc')

  //const signer = new ethers.Wallet(process.env.TESTWALLET_PRIVATE_KEY || '', provider);

  //const safe = await createSafe(signer.address, provider)
  //console.log('Safe created:', safe)

  try {
    //const yields = await client.getAllYieldOpportunities()
    //console.log('Yields:', yields)
    //console.log('Filtered Yields:', filteredYields)
  } catch (error) {
    console.error('Test failed:', error)
  }
  try{
    //const seesion = await client.createTransactionSession('enter', 'arbitrum-weth-aave-v3-lending', signer.address, '0.001')
    //await client.processTransaction(seesion.transactions, signer)

   
    // const signedTx = await walletClient.signTransaction({
    //   account: walletClient.account,
    //   data: unsignedTx.data,
    //   to: unsignedTx.to,
    //   from: unsignedTx.from,
    //   value: unsignedTx.value,
    //   maxFeePerGas: unsignedTx.maxFeePerGas,
    //   maxPriorityFeePerGas: unsignedTx.maxPriorityFeePerGas,
    //   type: 'eip1559',
    // })
    //console.log('signedTx:', signedTx)

    //const txHash = await client.submitSignedTransaction(seesion.transactions[0].id, signedTx)
    //console.log('Transaction hash:', txHash)
  } catch (error) {
    console.error('Test failed:', error)
  }

  // Get detailed info about a specific yield
  const yieldInfo = await client.getDetailedYieldOpportunity('arbitrum-dai-aave-v3-lending')

  // Filter lending opportunities
  const lendingYields = await client.filterYieldsByType([yieldInfo], 'lending')

  // Get APY info
  const apyInfo = await client.getYieldAPY(yieldInfo)

  // Get requirements
  const requirements = await client.getYieldRequirements(yieldInfo)

  console.log('Lending Yields:', lendingYields)
  console.log('APY Info:', apyInfo)
  console.log('Requirements:', requirements)
}

// Execute the tests
runTests().catch(console.error)

