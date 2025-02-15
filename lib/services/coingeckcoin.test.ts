import { getTopCoinMarketCapListByNetwork } from './coingeckcoin';
import fs from 'fs';

main();

async function main() {
    const result = await getTopCoinMarketCapListByNetwork(['arbitrum-one']);
    fs.writeFileSync('top_coins.json', JSON.stringify(result, null, 2));
}
