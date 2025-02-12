import Safe, { SigningMethod } from '@safe-global/protocol-kit'
import { ALCHEMY_RPC, getAlchemyRpcByChainId } from './alchemy'
import { arbitrum, optimism, base, mainnet, Chain } from 'viem/chains'
import { createPublicClient, encodeFunctionData, getContract, keccak256, toBytes } from 'viem'
import { http } from 'viem'
import { MetaTransactionData, SafeSignature } from '@safe-global/types-kit'
import { OperationType } from '@safe-global/types-kit'
import { COWSWAP_GPv2VAULT_RELAYER_ADDRESS, WETH_ADDRESS_ARBITRUM } from '../constants/constants'
import WETH_ABI from '../abi/weth'
import { getWethAddressByChainId } from '../utils'
import SafeApiKit from '@safe-global/api-kit'
import { privy, privyClient } from '../privy'
import { adjustVInSignature, EthSafeSignature } from '@safe-global/protocol-kit/dist/src/utils'
import { ETH_ADDRESS, TransactionParams } from '@cowprotocol/cow-sdk'
import { allow, exportToSafeTransactionBuilder, apply } from 'defi-kit/arb1'
import { encodeBytes32String } from 'defi-kit'
import { ModuleProxyFactory__factory } from '@/evm/typechain-types'
import { Roles__factory } from '@/evm/typechain-types'
import { utils } from 'ethers'

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
    const claims = await privy.getClaims();
    const delegatedWallets = await privy.getDelegatedWallets(claims.userId);

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

/////////////////////////////////////////////////////////////
// Pre-Sign CowSwap Transaction
/////////////////////////////////////////////////////////////
const preSignCowSwapTransaction = async (chain: Chain, safeAddress: string, transaction: TransactionParams) => {
    const claims = await privy.getClaims();
    const delegatedWallets = await privy.getDelegatedWallets(claims.userId);

    const safePreSignTx: MetaTransactionData = {
        to: transaction.to,
        value: transaction.value,
        data: transaction.data,
        operation: OperationType.Call,
    };

    const safe = await Safe.init({
        provider: getAlchemyRpcByChainId(chain.id),
        signer: SIGNER_PRIVATE_KEY,
        safeAddress: safeAddress,
    });

    const safeTx = await safe.createTransaction({
        transactions: [safePreSignTx],
        onlyCalls: true,
    });

    const safeTxHash = await safe.getTransactionHash(safeTx)
    const signature = await safe.signHash(safeTxHash)

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
        const safeSignature = await customSignHash(delegatedWallets[0].address, safeTxHash)
        await customConfirmation(safeSignature.data, safeTxHash, chain.id)

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

/////////////////////////////////////////////////////////////
// Setup Zodiac Role
/////////////////////////////////////////////////////////////
const ROLES_MASTERCOPY_ADDRESS = "0x9646fDAD06d3e24444381f44362a3B0eB343D337"
const PROXY_FACTORY_ADDRESS = "0x000000000000aDdB49795b0f9bA5BC298cDda236"
const SALT_NONCE = "0x0000000000000000000000000000000000000000000000000000000000000000"
const DEFAULT_MULTISEND_ADDRESSES = [
    "0x38869bf66a61cF6bDB996A6aE40D5853Fd43B526", // https://github.com/safe-global/safe-deployments/blob/5ec81e8d7a85d66a33adbe0c098068c0a96d917c/src/assets/v1.4.1/multi_send.json
    "0x9641d764fc13c8B624c04430C7356C1C7C8102e2", // https://github.com/safe-global/safe-deployments/blob/5ec81e8d7a85d66a33adbe0c098068c0a96d917c/src/assets/v1.4.1/multi_send_call_only.json
] as const
const RolesInterface = Roles__factory.createInterface()
const setupZodiacRole = async (owner: `0x${string}`, avatar: `0x${string}`, target: `0x${string}`, enableOnTarget = true,) => {
    // call for deploying the Roles mod proxy instance
    const setUpCalldata = Roles__factory.createInterface().encodeFunctionData(
        "setUp",
        [
            utils.defaultAbiCoder.encode(
                ["address", "address", "address"],
                [owner, avatar, target]
            ),
        ]
    )
    const deployModuleCalldata =
        ModuleProxyFactory__factory.createInterface().encodeFunctionData(
            "deployModule",
            [ROLES_MASTERCOPY_ADDRESS, setUpCalldata, SALT_NONCE]
        )
    const deployModuleCall = {
        to: PROXY_FACTORY_ADDRESS,
        data: deployModuleCalldata,
        value: "0",
    }

    // calculate deterministic proxy address for extra config calls
    const proxyAddress = calculateProxyAddress(setUpCalldata, SALT_NONCE)

    // calls for setting up multiSend transaction unwrapping
    const MULTISEND_SELECTOR = "0x8d80ff0a"
    const MULTISEND_UNWRAPPER = "0x93B7fCbc63ED8a3a24B59e1C3e6649D50B7427c0"
    const setTransactionUnwrapperCalls = DEFAULT_MULTISEND_ADDRESSES.map((address) => ({
        to: proxyAddress,
        data: RolesInterface.encodeFunctionData("setTransactionUnwrapper", [
            address,
            MULTISEND_SELECTOR,
            MULTISEND_UNWRAPPER,
        ]),
        value: "0",
    }))

    // calls for configuring members and permissions for all roles
    // const setUpRolesCalls = setUpRoles({ address: proxyAddress, roles })

    const enableOnTargetCall = {
        to: target,
        data: RolesInterface.encodeFunctionData("enableModule", [proxyAddress]),
        value: "0",
    }

    const transactions = [
        deployModuleCall,
        ...setTransactionUnwrapperCalls,
        // ...setUpRolesCalls,
        ...(enableOnTarget ? [enableOnTargetCall] : []),
    ]

    const claims = await privy.getClaims();
    const delegatedWallets = await privy.getDelegatedWallets(claims.userId);

    const safe = await Safe.init({
        provider: getAlchemyRpcByChainId(arbitrum.id),
        signer: SIGNER_PRIVATE_KEY,
        safeAddress: "0xd9CfA3466C6f075dEE7055082709fC000358DD81",
    });

    const safeTx = await safe.createTransaction({
        transactions: transactions,
        onlyCalls: true,
    });

    const safeTxHash = await safe.getTransactionHash(safeTx)
    const signature = await safe.signHash(safeTxHash)

    // Now the transaction with the signature is sent to the Transaction Service with the Api Kit:
    const apiKit = new SafeApiKit({
        chainId: BigInt(arbitrum.id)
    })

    await apiKit.proposeTransaction({
        safeAddress: "0xd9CfA3466C6f075dEE7055082709fC000358DD81",
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
        await customConfirmation(safeSignature.data, safeTxHash, arbitrum.id)

        // As only one more signater is required, AI agent can execute the transaction:
        // const signatures = await apiKit.getTransactionConfirmations(safeTxHash)
        // Need to refetch latest transaction that contains all signatures
        const safeTransaction = await apiKit.getTransaction(safeTxHash)
        const txResponse = await safe.executeTransaction(safeTransaction);
        console.log(`Transaction executed successfully [${txResponse.hash}]`);
        return txResponse
    }
}

const calculateProxyAddress = (initData: string, saltNonce: string) => {
    const byteCode =
        "0x602d8060093d393df3363d3d373d3d3d363d73" +
        ROLES_MASTERCOPY_ADDRESS.toLowerCase().slice(2) +
        "5af43d82803e903d91602b57fd5bf3"

    const salt = utils.solidityKeccak256(
        ["bytes32", "uint256"],
        [utils.solidityKeccak256(["bytes"], [initData]), saltNonce]
    )

    return utils.getCreate2Address(
        PROXY_FACTORY_ADDRESS,
        salt,
        keccak256(byteCode)
    ) as `0x${string}`
}


/////////////////////////////////////////////////////////////
// Grant Zodiac Role
/////////////////////////////////////////////////////////////
const SOL_ADDRESS = "0x2bcC6D6CdBbDC0a4071e48bb3B969b06B3330c07"
const ROLE_KEY = "creme"
const grantZodiacRole = async () => {
    const claims = await privy.getClaims();
    const delegatedWallets = await privy.getDelegatedWallets(claims.userId);

    const permissions = await allow.cowswap.swap({ buy: [ETH_ADDRESS, SOL_ADDRESS, WETH_ADDRESS_ARBITRUM], sell: [SOL_ADDRESS, WETH_ADDRESS_ARBITRUM] })
    const roleKey = encodeBytes32String(ROLE_KEY)

    const calls = await apply(roleKey, [permissions], {
        address: "0xBBeC1a24B1E0550486520Da31268f4603245fF8A",
        mode: 'replace', // keep the current permissions and add the new ones
        log: console.debug,
    })

    // Log the JSON that can be uploaded to the Safe Transaction Builder app for execution
    const safeCalls = exportToSafeTransactionBuilder(calls)

    const safe = await Safe.init({
        provider: getAlchemyRpcByChainId(arbitrum.id),
        signer: SIGNER_PRIVATE_KEY,
        safeAddress: "0xd9CfA3466C6f075dEE7055082709fC000358DD81",
    });

    const safeTx = await safe.createTransaction({
        transactions: safeCalls.transactions,
        onlyCalls: true,
    });

    const safeTxHash = await safe.getTransactionHash(safeTx)
    const signature = await safe.signHash(safeTxHash)

    // Now the transaction with the signature is sent to the Transaction Service with the Api Kit:
    const apiKit = new SafeApiKit({
        chainId: BigInt(arbitrum.id)
    })

    await apiKit.proposeTransaction({
        safeAddress: "0xd9CfA3466C6f075dEE7055082709fC000358DD81",
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
        await customConfirmation(safeSignature.data, safeTxHash, arbitrum.id)

        // As only one more signater is required, AI agent can execute the transaction:
        // const signatures = await apiKit.getTransactionConfirmations(safeTxHash)
        // Need to refetch latest transaction that contains all signatures
        const safeTransaction = await apiKit.getTransaction(safeTxHash)
        const txResponse = await safe.executeTransaction(safeTransaction);
        console.log(`Transaction executed successfully [${txResponse.hash}]`);
        return txResponse
    }

    // const txResponse = await safe.executeTransaction(safeTx);
    // console.log(`Transaction executed successfully [${txResponse.hash}]`);
}

export const safeService = {
    createSafe,
    wrapETHAndApprove,
    preSignCowSwapTransaction,
    grantZodiacRole,
    setupZodiacRole
}