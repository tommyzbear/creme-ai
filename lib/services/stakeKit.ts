import { fetch } from 'cross-fetch'
import { ethers } from 'ethers'

export interface StakeKitConfig {
  apiKey: string
  network?: string
  baseUrl?: string
}
export type EIP1559_GAS_ARGS = {
  maxFeePerGas: string,
  maxPriorityFeePerGas: string,
  type: number
}
export interface YieldOpportunity {
  id: string
  apy: number
  token: {
    address?: string
    symbol: string
  }
  metadata: {
    name: string
    cooldownPeriod?: { days: number }
    warmupPeriod?: { days: number }
    withdrawPeriod?: { days: number }
  }
  status: {
    enter: boolean
    exit: boolean
  }
}

export interface EarningPosition {
  integrationId: string
  amount: string
}

export interface BalanceResult {
  tokenAddress?: string
  amount: string
  symbol?: string
}

export interface TransactionSession {
  id: string
  integrationId: string
  status: string
  type: string
  currentStepIndex: number
  amount: string
  USDAmount: string
  tokenId: string
  validatorAddress: string | null
  validatorAddresses: string[] | null
  transactions: [
    {
      id: string,
      network: string,
      status: string,
      type: string,
      hash: string | null,
      createdAt: string,
      broadcastedAt: string | null,
      signedTransaction: string | null,
      unsignedTransaction: null,
      stepIndex: number,
      error: string | null,
      gasEstimate: string | null,
      explorerUrl: string | null,
      ledgerHwAppId: string | null,
      isMessage: boolean
    }
  ],
  createdAt: string,
  completedAt: string | null,
  inputToken: {
    network: string,
    name: string,
    symbol: string,
    decimals: number,
    coinGeckoId: string,
    logoURI: string
  },
  addresses: { address: string }
}
 
interface SignedTransactionResponse {
  id: string
  status: string
  transaction: {
    hash: string
  }
}

interface Response {
  data: string
}

export class StakeKitClient {
  private readonly config: Required<StakeKitConfig>

  constructor(config: StakeKitConfig) {
    this.config = {
      baseUrl: 'https://api.stakek.it',
      network: config.network || '',
      ...config
    }
  }

  // 基础API方法
  private async request<T>(
    method: 'GET' | 'POST' | 'PATCH', 
    path: string, 
    body?: Record<string, unknown>
  ): Promise<T> {
    const url = `${this.config.baseUrl}${path}`
    const headers = {
      'Content-Type': 'application/json',
      'X-API-KEY': this.config.apiKey
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(`API request failed: ${response.status} ${response.statusText}${
          errorData ? ` - ${JSON.stringify(errorData)}` : ''
        }`)
      }

      return response.json()
    } catch (error) {
      throw new Error(`StakeKit API error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // 获取所有收益机会
  async getAllYieldOpportunities(): Promise<YieldOpportunity[]> {
    interface YieldResponse {
      data: YieldOpportunity[]
    }
    
    return this.request<YieldResponse>('GET', `/v2/yields?network=${this.config.network}`)
      .then(resp => resp.data)
  }

  // 获取用户持仓
  async getEarningPositions(address: string): Promise<EarningPosition[]> {
    const allYields = await this.getAllYieldOpportunities()
    const chunkSize = 15
    const positions: EarningPosition[] = []

    interface BalanceResponse {
      integrationId: string
      balances: Array<{
        type: string
        amount: string
      }>
    }

    for (let i = 0; i < allYields.length; i += chunkSize) {
      const chunk = allYields.slice(i, i + chunkSize)
      const payload = chunk.map(y => ({
        addresses: { address },
        integrationId: y.id
      }))

      const resp = await this.request<BalanceResponse[]>('POST', '/v1/yields/balances', { payload })
      
      for (const item of resp) {
        const staked = item.balances.find(b => b.type === 'staked')
        if (staked && parseFloat(staked.amount) > 0) {
          positions.push({
            integrationId: item.integrationId,
            amount: staked.amount
          })
        }
      }
    }

    return positions
  }

  // 获取用户余额
  async getUserBalances(address: string): Promise<BalanceResult[]> {
    const yields = await this.getAllYieldOpportunities()
    const tokens = new Set(yields.map(y => y.token.address?.toLowerCase()))

    const payload = Array.from(tokens).map(addr => ({
      network: this.config.network,
      address,
      ...(addr && { tokenAddress: addr })
    }))

    const resp = await this.request<Array<{
      token: { address?: string; symbol: string }
      amount: string
    }>>('POST', '/v1/tokens/balances', { addresses: payload })

    return resp.map(b => ({
      tokenAddress: b.token.address?.toLowerCase(),
      symbol: b.token.symbol,
      amount: b.amount
    })).filter(b => parseFloat(b.amount) > 0)
  }

  // 创建存款/取款会话
  async createTransactionSession(
    action: 'enter' | 'exit',
    integrationId: string,
    address: string,
    amount: string
  ): Promise<TransactionSession> {
    return this.request('POST', `/v1/actions/${action}`, {
      integrationId,
      addresses: { address },
      args: { amount }
    })
  }

  // 获取交易详情
  async getTransactionDetails(txId: string): Promise<Response> {
    return this.request('GET', `/v1/transactions/${txId}`)
  }

  async processTransaction(
    transactions: any[], 
    wallet: ethers.Signer
  ) {
  for (const tx of transactions) {
    if (tx.status === "SKIPPED") continue;

    console.log(`Earn Agent => TX => ${tx.type}`);
    let unsignedTx: any;
    for (let i = 0; i < 3; i++) {
      try {
        unsignedTx = await this.request('PATCH', `/v1/transactions/${tx.id}`, {});
        break;
      } catch (err) {
        console.log(`Attempt ${i + 1} => retrying...`);
        console.log(err);
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
    if (!unsignedTx) {
      console.log("cannot construct TX => skip");
      console.log(tx);
      continue;
    }
    const jsonTx = JSON.parse(unsignedTx.unsignedTransaction);
    console.log(jsonTx);
    const signedTx = await wallet.signTransaction(jsonTx);
    console.log(signedTx);
    const submitResult = await this.request('POST', `/v1/transactions/${tx.id}/submit`, { signedTransaction: signedTx });
    console.log(" TX submitted =>", submitResult);
    
  }
}
  // 提交已签名交易
  async submitSignedTransaction(txId: string, signedTx: string): Promise<SignedTransactionResponse> {
    return this.request('POST', `/v1/transactions/${txId}/submit`, {
      signedTransaction: signedTx
    })
  }

  // 过滤和排序收益机会
  filterAndSortYields(yields: YieldOpportunity[], tokenAddress?: string): YieldOpportunity[] {
    return yields
      .filter(y => {
        const noCooldown = !y.metadata.cooldownPeriod || y.metadata.cooldownPeriod.days === 0
        const noWarmup = !y.metadata.warmupPeriod || y.metadata.warmupPeriod.days === 0
        const noWithdraw = !y.metadata.withdrawPeriod || y.metadata.withdrawPeriod.days === 0
        const tokenMatch = tokenAddress ? y.token.address === tokenAddress : true  
        return y.status.enter && y.status.exit && noCooldown && noWarmup && noWithdraw && tokenMatch
      })
      .sort((a, b) => b.apy - a.apy)
  }
}


