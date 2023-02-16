import { Wallet as RainbowkitWallet, connectorsForWallets } from '@rainbow-me/rainbowkit'
import { createClient, configureChains } from 'wagmi'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { foundry } from 'wagmi/chains'
import { MockConnector } from 'wagmi/connectors/mock'
import { Wallet, providers } from 'ethers'

const ANVIL_URL = foundry.rpcUrls.default

export const TEST_WALLETS: RainbowkitWallet[] = [
  {
    id: 'alice',
    name: 'Alice',
    iconUrl: '',
    iconBackground: 'red',
    createConnector: makeCreateConnectorFor(
      '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
    ),
  },
  {
    id: 'bob',
    name: 'Bob',
    iconUrl: '',
    iconBackground: 'blue',
    createConnector: makeCreateConnectorFor(
      '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'
    ),
  },
  {
    id: 'carol',
    name: 'Carol',
    iconUrl: '',
    iconBackground: 'yellow',
    createConnector: makeCreateConnectorFor(
      '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a'
    ),
  },
]

function makeCreateConnectorFor(address: `0x${string}`) {
  return () => ({
    connector: new MockConnector({
      chains: [foundry],
      options: {
        signer: new Wallet(address, new providers.JsonRpcProvider(ANVIL_URL)),
      },
    }),
  })
}

export const { provider, webSocketProvider, chains } = configureChains(
  [foundry],
  [jsonRpcProvider({ rpc: () => ({ http: ANVIL_URL }) })]
)

const connectors = connectorsForWallets([
  {
    groupName: 'Test wallets',
    wallets: TEST_WALLETS,
  },
])

export const client = createClient({
  provider,
  webSocketProvider,
  connectors,
})