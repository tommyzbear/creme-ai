import { safeService } from './safe'
import { Chain } from 'viem'

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



interface Response {
  data: string
}

export interface BalanceResponse {
  integrationId: string
  groupId: string
  type: string
  amount: string
  pricePerShare: string
  pendingActions: string[]
  token: {
    name: string
    symbol: string
    decimals: number
    network: string
    address: string
    logoURI: string
  }
}

interface ActionListResponse {
  data: {
    integrationId: string,
    status: string,
    type: string,
  }[],
  hasNextPage: boolean,
  page: number,
}

interface TokenInfo {
  address: string;
  symbol: string;
  network: string;
}

interface FilteredYieldOpportunity {
  id: string;
  apy: number;
  token: {
    symbol: string;
    address: string;
    network: string;
  };
  metadata: {
    type: string;
    name: string;
    provider: {
      name: string;
    };
  };
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
    const url = `${this.config.baseUrl}${path}`;
    console.log('Making request to:', url);

    const headers = {
      'Content-Type': 'application/json',
      'X-API-KEY': this.config.apiKey
    };

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      // console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${JSON.stringify(data)}`);
      }

      return data;
    } catch (error) {
      console.error('Request error:', error);
      throw error;
    }
  }

  // 获取integrationIds
  async getIntegrationIdsByAddress(address: string, status?: string): Promise<string[]> {
    const integrationIds: Set<string> = new Set()
    let currentPage = 1
    let hasNextPage = true

    while (hasNextPage) {
      try {
        const resp = await this.request<ActionListResponse>(
          'GET',
          `/v1/actions?walletAddress=${address}&page=${currentPage}`
        )

        // Filter data if network and status are provided
        const filteredData = status
          ? resp.data.filter(item => item.status === status)
          : resp.data

        // Add filtered integration IDs to Set to avoid duplicates
        filteredData.forEach(item => integrationIds.add(item.integrationId))

        hasNextPage = resp.hasNextPage
        currentPage++

        // Optional: Add delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error('Error fetching integration IDs:', error)
        break // Exit loop on error but return what we have
      }
    }

    return Array.from(integrationIds)
  }
  // 获取用户持仓
  async getYieldBalance(address: string): Promise<BalanceResponse[]> {
    const balances: BalanceResponse[] = []
    const integrationIds = await this.getIntegrationIdsByAddress(address)
    for (const integrationId of integrationIds) {
      const resp = await this.request<BalanceResponse>('POST', `/v1/yields/${integrationId}/balances`, {
        addresses: { address }
      })

      const item = {
        groupId: resp[0].groupId,
        type: resp[0].type,
        amount: resp[0].amount,
        pricePerShare: resp[0].pricePerShare,
        pendingActions: resp[0].pendingActions,
        token: resp[0].token,
        integrationId: integrationId
      }
      balances.push(item)
    }

    return balances
  }

  async getAvailableYields(network: string, type?: string): Promise<YieldOpportunity[]> {
    try {
      // console.log('Fetching yields for network:', network);
      let endpoint = `/v1/yields/enabled?network=${network}`;
      if (type) {
        endpoint += `&type=${type}`;
      }

      const resp = await this.request('GET', endpoint);
      // console.log('Raw API response:', resp);

      // Ensure we're accessing the correct data structure
      const yields = resp.data || [];

      // Filter active yields
      const activeYields = yields.filter(item =>
        item.status.enter && item.status.exit
      );

      // console.log('Active yields:', activeYields);
      return activeYields;
    } catch (error) {
      console.error('Error in getAvailableYields:', error);
      throw error;
    }
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
    walletAddress: string,
    chain: Chain,
  ) {
    const txs: string[] = []
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
      const txHash = await safeService.processStakeKitTransaction(chain, walletAddress, jsonTx)
      if (txHash) {
        await new Promise((r) => setTimeout(r, 1000));
        for (let i = 0; i < 3; i++) {
          try {
            await this.submitTransactionHash(tx.id, txHash)
            break;
          } catch (err) {
            console.log(`Attempt ${i + 1} => retrying...`);
            console.log(err);
            await new Promise((r) => setTimeout(r, 1000));
          }
        }
        txs.push(txHash)
      }
    }
    return txs
  }

  // 给token address，过滤和排序收益
  async filterAndSortYields(yields: YieldOpportunity[], tokenAddress?: string): Promise<YieldOpportunity[]> {
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

  async submitTransactionHash(txsID: string, hash: string): Promise<Response> {
    return this.request('POST', `/v1/transactions/${txsID}/submit_hash`, {
      hash: hash
    })
  }

  async getTokenYieldOpportunities(
    network: string,
    tokens: TokenInfo[]
  ): Promise<FilteredYieldOpportunity[]> {
    try {
      // console.log('Getting yields for network:', network);

      // Get all available yields for the network
      const allYields = await this.getAvailableYields(network);
      // console.log('All available yields:', allYields);

      // Convert network names for comparison
      const normalizedNetwork = this.normalizeNetwork(network);

      // Filter yields based on token addresses and active status
      const filteredYields = allYields.filter(yieldOpportunity => {
        // Check if yield is active
        const isActive = yieldOpportunity.status.enter && yieldOpportunity.status.exit;

        // Check if the yield's token matches any of our input tokens
        const matchingToken = tokens.find(token => {
          // Normalize addresses for comparison
          const tokenAddr = token.address.toLowerCase();
          const yieldAddr = (yieldOpportunity.token.address || '').toLowerCase();

          // Convert token network for comparison
          const tokenNetwork = this.normalizeNetwork(token.network);

          const match = tokenAddr === yieldAddr &&
            tokenNetwork === normalizedNetwork;

          // console.log('Token match check:', {
          //   tokenAddress: tokenAddr,
          //   yieldAddress: yieldAddr,
          //   tokenNetwork: tokenNetwork,
          //   yieldNetwork: normalizedNetwork,
          //   isMatch: match
          // });
          return match;
        });

        return isActive && matchingToken;
      });

      // console.log('Filtered yields:', filteredYields);

      // Transform to simplified format
      const transformedYields = filteredYields.map(yieldOpportunity => ({
        id: yieldOpportunity.id,
        apy: yieldOpportunity.apy,
        token: {
          symbol: yieldOpportunity.token.symbol,
          address: yieldOpportunity.token.address || '',
          network: network
        },
        metadata: {
          type: yieldOpportunity.metadata.type,
          name: yieldOpportunity.metadata.name,
          provider: {
            name: yieldOpportunity.metadata.provider.name
          }
        }
      }));

      // console.log('Transformed yields:', transformedYields);
      return transformedYields;
    } catch (error) {
      console.error('Error in getTokenYieldOpportunities:', error);
      throw error;
    }
  }

  // Add this helper method to normalize network names
  private normalizeNetwork(network: string): string {
    // Convert chain IDs to network names
    const networkMap: { [key: string]: string } = {
      '1': 'ethereum',
      '42161': 'arbitrum',
      '10': 'optimism',
      '8453': 'base'
    };

    // Remove 'eip155:' prefix if present
    const cleanNetwork = network.replace('eip155:', '');

    // Return normalized network name
    return networkMap[cleanNetwork] || cleanNetwork.toLowerCase();
  }

  async getHighestYieldForTokens(
    network: string,
    tokens: TokenInfo[],
    type?: string
  ): Promise<FilteredYieldOpportunity[]> {
    // console.log('Getting highest yields for:', { network, tokens, type });

    try {
      const yields = await this.getTokenYieldOpportunities(network, tokens);
      // console.log('All yields before filtering:', yields);

      // Filter by type if specified
      const filteredYields = type
        ? yields.filter(y => y.metadata.type === type)
        : yields;

      // console.log('Yields after type filtering:', filteredYields);

      // Sort by APY in descending order
      const sortedYields = filteredYields.sort((a, b) => b.apy - a.apy);
      // console.log('Final sorted yields:', sortedYields);

      return sortedYields;
    } catch (error) {
      console.error('Error in getHighestYieldForTokens:', error);
      throw error;
    }
  }

  async createExitRequest(
    positionId: string,
    safeAddress: string,
    amount: string
  ): Promise<TransactionSession> {
    try {
      console.log('Creating exit request for:', { positionId, safeAddress, amount });

      const session = await this.createTransactionSession(
        'exit',
        positionId,
        safeAddress,
        amount
      );

      return session;
    } catch (error) {
      console.error('Error creating exit request:', error);
      throw error;
    }
  }
}



