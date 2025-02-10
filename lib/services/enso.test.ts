import {enso} from './enso';
import { RouteParams, ApproveParams } from '@ensofinance/sdk';
import fs from 'fs';
// Example test case
async function testGetRouterData() {
  try {
    const routeRequest = {
        fromAddress: "0x60bA23C0cC60C11596497e822348590387a56dcc",
        receiver: "0x60bA23C0cC60C11596497e822348590387a56dcc",
        spender: "0x60bA23C0cC60C11596497e822348590387a56dcc",
        chainId: 42161,
        amountIn: "1000000000000000000",
        tokenIn: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        tokenOut: "0x912CE59144191C1204E64559FE8253a0e49E6548",
        routingStrategy: "delegate", // optional
    };

    const routes = await enso.getRouterData(routeRequest as RouteParams);
    console.log('Routes:', routes.tx.data);
    }catch(error){
        console.error('Test failed:', error);
    }
}
// Example test case
async function testGetApproveData() {
    try {
      const routeRequest = {
          fromAddress: "0x60bA23C0cC60C11596497e822348590387a56dcc",
          tokenAddress: "0x912CE59144191C1204E64559FE8253a0e49E6548",
          chainId: 42161,
          amount: "1000000000000000000"
      };
  
      const approveData = await enso.getApprovalData(routeRequest as ApproveParams);
      console.log('Approve Data:', approveData.gas);
 
      }catch(error){
          console.error('Test failed:', error);
      }
  }
  async function getTokenData(){
    const tokenData = await enso.getTokenData({
        chainId: 42161,
        includeMetadata: true,
    });
    //store the token data into a json file
    fs.writeFileSync('tokenData.json', JSON.stringify(tokenData, null, 2));
  }
  getTokenData();