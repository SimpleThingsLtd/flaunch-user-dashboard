import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, polygon, optimism, arbitrum, base } from 'wagmi/chains'

export const web3Config = getDefaultConfig({
  appName: 'Flaunch User Dashboard',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
  chains: [mainnet, base, polygon, optimism, arbitrum],
  ssr: true,
})

// FLAY Token Configuration
export const FLAY_TOKEN = {
  address: '0xf1a7000000950c7ad8aff13118bb7ab561a448ee' as `0x${string}`,
  symbol: 'FLAY',
  decimals: 18,
  minBalance: 100, // Minimum required FLAY tokens
}

// 0x API Configuration (now handled via Next.js API routes)
// The API key is kept server-side for security 