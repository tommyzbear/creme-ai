import fs from 'fs';

export interface coinProperties {
    id: string,
    symbol: string,
    name: string,
    current_price: number,
    market_cap: number,
    is_stablecoin: boolean,
    is_restakingCoin: boolean,
    networks: {
        address: string
    }
}
//get coin given a network list
function getCoinsbyNetwork(network: string[]) {
    const coins = JSON.parse(fs.readFileSync('./../data/coinsfromCoingecko.json', 'utf8'));
    
    const normalizedNetworks = network.map(net => {
        const lowercaseNet = net.toLowerCase();
        return lowercaseNet === 'arbitrum' ? 'arbitrum-one' : lowercaseNet;
    });

    const result = coins.filter((coin: any) => {
        return coin.platforms && normalizedNetworks.some(net => 
            Object.keys(coin.platforms).map(p => p.toLowerCase()).includes(net)
        );
    });
    
    return result;
}

async function getTopCoinMarketCapListByNetwork(network: string[]) {  
    const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=200';
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            'x-cg-demo-api-key': process.env.COINGECKO_API_KEY
        }
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const marketData = await response.json();
        
        // Get coins that exist in the specified networks
        const networkCoins = getCoinsbyNetwork(network);
        
        // Filter market data to only include coins that exist in our networks
        const filteredMarketData = marketData.filter((marketCoin: any) =>
            networkCoins.some((networkCoin: any) => 
                networkCoin.id === marketCoin.id
            )
        ).map((marketCoin: any) => {
            const networkCoin = networkCoins.find((nc: any) => nc.id === marketCoin.id);
            return {
                ...marketCoin,
                platforms: networkCoin.platforms // Add the networks/platforms information
            };
        });
        return filteredMarketData

    } catch (error) {
        console.error('Error fetching market data:', error);
        throw error;
    }
}

export { getTopCoinMarketCapListByNetwork };













