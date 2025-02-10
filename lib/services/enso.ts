import { EnsoClient} from '@ensofinance/sdk';
const API_KEY = process.env.ENSO_API_KEY;

if (!API_KEY) {
    throw new Error('ENSO_API_KEY is not set');
}

export const enso = new EnsoClient({ apiKey: API_KEY });


// export async function getRouterData(  routeParams: RouteParams) {
//     try {
//         const response = await enso.getRouterData(routeParams);
//         return response;
//     } catch (error) {
//         console.error('Error in getRouterData:', error);
//         return null;
//     }
// }

//If the EoA doesn't hold enough funds or allowance to execute the transaction, 
//the route endpoint won't be able to calculate the best route.
// export async function getQuoteData(quoteParams: QuoteParams) {
//     try {
//         const quote = await enso.getQuoteData(quoteParams);
//         return quote;
//     } catch (error) {
//         console.error('Error in getQuoteData:', error);
//         return null;
//     }
// }

// export async function getApproveData(approveParams: ApproveParams) {
//     try {
//         const approve = await enso.getApprovalData(approveParams);
//         return approve;
//     } catch (error) {
//         console.error('Error in getApproveData:', error);
//         return null;
//     }
// }