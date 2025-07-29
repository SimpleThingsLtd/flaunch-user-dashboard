'use client'

import React, { ReactNode } from 'react'
import { PrivyProvider } from '@privy-io/react-auth'
import { SmartWalletsProvider } from '@privy-io/react-auth/smart-wallets'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createConfig, http, WagmiProvider } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { 
  RainbowKitProvider, 
  connectorsForWallets,
  lightTheme
} from '@rainbow-me/rainbowkit'
import { toPrivyWallet } from '@privy-io/cross-app-connect/rainbow-kit'
import '@rainbow-me/rainbowkit/styles.css'
import type { Chain } from 'wagmi/chains'

// Create a new QueryClient
const queryClient = new QueryClient()

// Limit to Base and Base Sepolia chains
const supportedChains: readonly [Chain, ...Chain[]] = [base, baseSepolia]

// Configure RainbowKit with the Privy wallet
const connectors = connectorsForWallets(
  [
    {
      groupName: 'Privy Wallets',
      wallets: [
        toPrivyWallet({
          id: process.env.NEXT_PUBLIC_PRIVY_PROVIDER_ID!,
          name: 'Flaunch',
          iconUrl: 'https://flaunch.gg/icon.png'
        })
      ]
    }
  ],
  { 
    appName: 'Flaunch User Dashboard',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo'
  }
)

// Create wagmi config with the connectors
const config = createConfig({
  chains: supportedChains,
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http()
  },
  connectors,
  ssr: true
})

type Web3ProvidersProps = { children: ReactNode }

export function Web3Providers({ children }: Web3ProvidersProps) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        embeddedWallets: {
          showWalletUIs: false,
          createOnLogin: 'all-users'
        },
        appearance: {
          theme: 'light'
        },
        // Add Flaunch as a login option in Privy (with email fallback for testing)
        loginMethodsAndOrder: {
          primary: [`privy:${process.env.NEXT_PUBLIC_PRIVY_PROVIDER_ID}`, 'email']
        },
        // Base network configuration
        defaultChain: base,
        supportedChains: [...supportedChains]
      }}
    >
      <SmartWalletsProvider>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider 
              theme={lightTheme()}
            >
              {children}
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </SmartWalletsProvider>
    </PrivyProvider>
  )
} 