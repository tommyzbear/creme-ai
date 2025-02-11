import Safe, { SigningMethod } from '@safe-global/protocol-kit'
import { ALCHEMY_RPC, getAlchemyRpcByChainId } from './alchemy'
import { arbitrum, optimism, base, mainnet, Chain } from 'viem/chains'
import { createPublicClient, encodeFunctionData, getContract, toBytes } from 'viem'
import { http } from 'viem'
import { MetaTransactionData, SafeSignature } from '@safe-global/types-kit'
import { OperationType } from '@safe-global/types-kit'
import { COWSWAP_GPv2VAULT_RELAYER_ADDRESS } from '../constants/constants'
import WETH_ABI from '../abi/weth'
import { getWethAddressByChainId } from '../utils'
import SafeApiKit from '@safe-global/api-kit'
import { privyClient } from '../privy'
import { WalletWithMetadata } from '@privy-io/server-auth'
import { cookies } from 'next/headers'
import { adjustVInSignature, EthSafeSignature } from '@safe-global/protocol-kit/dist/src/utils'

const SIGNER_ADDRESS = process.env.AGENT_SIGNER_ADDRESS
const SIGNER_PRIVATE_KEY = process.env.AGENT_SIGNER_PRIVATE_KEY
const SAFE_TRANSACTION_API_ARBITRUM = "https://safe-transaction-arbitrum.safe.global"
const SAFE_TRANSACTION_API_OPTIMISM = "https://safe-transaction-optimism.safe.global"
const SAFE_TRANSACTION_API_BASE = "https://safe-transaction-base.safe.global"
const SAFE_TRANSACTION_API_MAINNET = "https://safe-transaction-mainnet.safe.global"

/////////////////////////////////////////////////////////////
// Create a Safe
/////////////////////////////////////////////////////////////
const createSafe = async (chain: Chain, embeddedWalletAddress: string, ownerAddress: string) => {
    if (!SIGNER_ADDRESS || !SIGNER_PRIVATE_KEY || !embeddedWalletAddress) {
        throw new Error('Missing required environment variables')
    }

    let safe = null

    switch (chain.id) {
        case arbitrum.id:
            safe = await Safe.init({
                provider: ALCHEMY_RPC.ARBITRUM_ONE,
                signer: SIGNER_PRIVATE_KEY,
                predictedSafe: {
                    safeAccountConfig: {
                        owners: [SIGNER_ADDRESS, embeddedWalletAddress, ownerAddress],
                        threshold: 2
                    }
                }
            })
            break
        case optimism.id:
            safe = await Safe.init({
                provider: ALCHEMY_RPC.OPTIMISM_MAINNET,
                signer: SIGNER_PRIVATE_KEY,
                predictedSafe: {
                    safeAccountConfig: {
                        owners: [SIGNER_ADDRESS, embeddedWalletAddress, ownerAddress],
                        threshold: 2
                    }
                }
            })
            break
        case base.id:
            safe = await Safe.init({
                provider: ALCHEMY_RPC.BASE_MAINNET,
                signer: SIGNER_PRIVATE_KEY,
                predictedSafe: {
                    safeAccountConfig: {
                        owners: [SIGNER_ADDRESS, embeddedWalletAddress, ownerAddress],
                        threshold: 2
                    }
                }
            })
            break
        case mainnet.id:
            safe = await Safe.init({
                provider: ALCHEMY_RPC.ETHEREUM_MAINNET,
                signer: SIGNER_PRIVATE_KEY,
                predictedSafe: {
                    safeAccountConfig: {
                        owners: [SIGNER_ADDRESS, embeddedWalletAddress, ownerAddress],
                        threshold: 2
                    }
                }
            })
            break
        default:
            throw new Error(`Unsupported chain: ${chain}`)
    }

    if (!safe) {
        throw new Error('Failed to create safe')
    }

    const safeAddress = await safe.getAddress();
    console.log('Safe address:', safeAddress);

    const deploymentTransaction = await safe.createSafeDeploymentTransaction();
    console.log('Deployment transaction:', deploymentTransaction);

    const client = await safe.getSafeProvider().getExternalSigner();

    if (!client) {
        throw new Error('Failed to get external signer')
    }

    const transactionHash = await client.sendTransaction({
        to: deploymentTransaction.to as `0x${string}`,
        value: BigInt(deploymentTransaction.value),
        data: deploymentTransaction.data as `0x${string}`,
        chain: chain,
    });
    console.log('Transaction hash:', transactionHash);

    // const walletClient = createWalletClient({ transport: http(ALCHEMY_RPC.ETHEREUM_MAINNET), chain: chain });
    const publicClient = createPublicClient({
        chain: chain,
        transport: http(),
    });

    const receipt = await publicClient.waitForTransactionReceipt({
        hash: transactionHash,
    });

    console.log('Receipt:', receipt);

    return { safe, safeAddress, deploymentTransaction }
}

/////////////////////////////////////////////////////////////
// Required to Wrap ETH to WETH
/////////////////////////////////////////////////////////////
const wrapETHAndApprove = async (chain: Chain, inputAmount: string, safeAddress: string) => {
    const cookieStore = await cookies();
    const cookieAuthToken = cookieStore.get("privy-token");

    if (!cookieAuthToken) {
        return {
            error: 'Unauthorized',
            message: 'Unauthorized'
        }
    }

    const claims = await privyClient.verifyAuthToken(cookieAuthToken.value);

    if (!claims) {
        return {
            error: 'Unauthorized',
            message: 'Unauthorized'
        }
    }

    const user = await privyClient.getUser(claims.userId);

    const embeddedWallets = user.linkedAccounts.filter(
        (account): account is WalletWithMetadata =>
            account.type === 'wallet' && account.walletClientType === 'privy',
    );
    const delegatedWallets = embeddedWallets.filter((wallet) => wallet.delegated);


    const publicClient = createPublicClient({
        chain: chain,
        transport: http(),
    });

    const callDataDeposit = encodeFunctionData({
        abi: WETH_ABI,
        functionName: "deposit",
        args: [],
    });

    // Exchange ETH to WETH
    const safeDepositTx: MetaTransactionData = {
        to: getWethAddressByChainId(chain.id),
        value: inputAmount, // ether * decimal to String
        data: callDataDeposit,
        operation: OperationType.Call,
    };

    const wethInstance = getContract({
        address: getWethAddressByChainId(chain.id),
        abi: WETH_ABI,
        client: publicClient,
    });

    const callDataApprove = encodeFunctionData({
        abi: WETH_ABI,
        functionName: "approve",
        args: [COWSWAP_GPv2VAULT_RELAYER_ADDRESS, inputAmount],
    });

    const safeApproveTx: MetaTransactionData = {
        to: getWethAddressByChainId(chain.id),
        value: "0",
        data: callDataApprove,
        operation: OperationType.Call,
    };

    console.log(
        `ETH balance before: [${await publicClient.getBalance({
            address: safeAddress as `0x${string}`,
        })}]`
    );

    console.log(`WETH balance before [${await wethInstance.read.balanceOf([safeAddress])}]`);

    const safe = await Safe.init({
        provider: getAlchemyRpcByChainId(chain.id),
        signer: SIGNER_PRIVATE_KEY,
        safeAddress: safeAddress,
    });

    const safeTx = await safe.createTransaction({
        transactions: [safeDepositTx, safeApproveTx],
        onlyCalls: true,
    });

    // Every transaction has a Safe (Smart Account) Transaction Hash different than the final transaction hash
    const safeTxHash = await safe.getTransactionHash(safeTx)
    // The AI agent signs this Safe (Smart Account) Transaction Hash
    const signature = await safe.signHash(safeTxHash)


    // Now the transaction with the signature is sent to the Transaction Service with the Api Kit:
    const apiKit = new SafeApiKit({
        chainId: BigInt(chain.id)
    })

    await apiKit.proposeTransaction({
        safeAddress: safeAddress,
        safeTransactionData: safeTx.data,
        safeTxHash,
        senderSignature: signature.data,
        senderAddress: SIGNER_ADDRESS as `0x${string}`
    })

    // If the user has a delegated wallet, then provide the 2nd signature for the transaction and auto-execute
    if (delegatedWallets.length > 0) {
        console.log("Delegated wallet found", delegatedWallets[0].address)
        // We assume there is only one pending transaction
        const safeSignature = await customSignHash(delegatedWallets[0].address, safeTxHash)
        await customConfirmation(safeSignature.data, safeTxHash, chain.id)

        // As only one more signater is required, AI agent can execute the transaction:
        // const signatures = await apiKit.getTransactionConfirmations(safeTxHash)
        // Need to refetch latest transaction that contains all signatures
        const safeTransaction = await apiKit.getTransaction(safeTxHash)
        const txResponse = await safe.executeTransaction(safeTransaction);
        console.log(`Transaction executed successfully [${txResponse.hash}]`);
    }
}

const customSignHash = async (address: string, hash: string): Promise<SafeSignature> => {

    const signatureResponse = await privyClient.walletApi.ethereum.signMessage({
        address,
        chainType: 'ethereum',
        message: toBytes(hash)
    })

    const signature = await adjustVInSignature(SigningMethod.ETH_SIGN, signatureResponse.signature, hash, address)

    const safeSignature = new EthSafeSignature(address, signature, true)

    return safeSignature
}

const customConfirmation = async (signature: string, safeTxHash: string, chainId: number) => {
    let safeTransactionServiceUrl = ""

    switch (chainId) {
        case arbitrum.id:
            safeTransactionServiceUrl = SAFE_TRANSACTION_API_ARBITRUM
            break
        case optimism.id:
            safeTransactionServiceUrl = SAFE_TRANSACTION_API_OPTIMISM
            break
        case base.id:
            safeTransactionServiceUrl = SAFE_TRANSACTION_API_BASE
            break
        case mainnet.id:
            safeTransactionServiceUrl = SAFE_TRANSACTION_API_MAINNET
            break
        default:
            throw new Error(`Unsupported chain: ${chainId}`)
    }

    const response = await fetch(`${safeTransactionServiceUrl}/api/v1/multisig-transactions/${safeTxHash}/confirmations/`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            signature
        })
    })

    console.log("Response:", response)

    let jsonResponse: any
    try {
        jsonResponse = response.json()
    } catch (error) {
        if (!response.ok) {
            throw new Error(response.statusText)
        }
    }

    if (response.ok) {
        return jsonResponse
    }

    throw new Error(jsonResponse.message)
}

export const safeService = {
    createSafe,
    wrapETHAndApprove
}