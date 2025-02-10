import { getRoutes } from "./services/enso.js";

async function testEnsoRoute() {
    try {
        const testRequest = {
            fromAddress: "0x60bA23C0cC60C11596497e822348590387a56dcc" as `0x${string}`,
            receiver: "0x60bA23C0cC60C11596497e822348590387a56dcc" as `0x${string}`,
            spender: "0x60bA23C0cC60C11596497e822348590387a56dcc" as `0x${string}`,
            chainId: 42161,
            amountIn: "1000000000000000000",
            tokenIn: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" as `0x${string}`,
            tokenOut: "0x912CE59144191C1204E64559FE8253a0e49E6548" as `0x${string}`,
            routingStrategy: "delegate" as const,
        };

        const routes = await getRoutes(testRequest);
        console.log("Routes found:", routes);
    } catch (error) {
        console.error("Error testing Enso route:", error);
    }
}

testEnsoRoute();
