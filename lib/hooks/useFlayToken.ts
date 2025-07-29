'use client'

import { useReadContract, useBalance } from 'wagmi'
import { useState, useEffect } from 'react'
import { formatUnits } from 'viem'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useCrossAppAccounts } from '@privy-io/react-auth'
import type { CrossAppAccount } from '@privy-io/react-auth'

// FLAY Token Configuration
const FLAY_TOKEN = {
  address: '0xf1a7000000950c7ad8aff13118bb7ab561a448ee' as `0x${string}`,
  symbol: 'FLAY',
  decimals: 18,
  minBalance: 100, // Minimum required FLAY tokens
}

// ERC-20 Token ABI (just the balanceOf function)
const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: 'balance', type: 'uint256' }],
  },
] as const

export function useFlayToken() {
  const { user, authenticated } = usePrivy()
  const { wallets } = useWallets()
  const { sendTransaction: sendCrossAppTransaction } = useCrossAppAccounts()
  const [buyQuote, setBuyQuote] = useState<any>(null)
  const [loadingQuote, setLoadingQuote] = useState(false)
  const [crossAppAccount, setCrossAppAccount] = useState<CrossAppAccount | null>(null)
  const [flayPriceUSD, setFlayPriceUSD] = useState<number>(0)

  // Find cross-app account when user is authenticated
  useEffect(() => {
    if (!user) {
      setCrossAppAccount(null)
      return
    }

    const foundAccount = user.linkedAccounts.find(
      (acct) =>
        acct.type === 'cross_app' &&
        acct.providerApp.id === process.env.NEXT_PUBLIC_PRIVY_PROVIDER_ID
    ) as CrossAppAccount | undefined

    setCrossAppAccount(foundAccount || null)
  }, [user])

  // Get wallet address - try cross-app first, then regular Privy wallet
  const getCrossAppAddress = () => crossAppAccount?.embeddedWallets?.[0]?.address
  const getPrivyWalletAddress = () => {
    const privyWallet = wallets.find(wallet => wallet.walletClientType === 'privy')
    return privyWallet?.address
  }
  
  const address = (getCrossAppAddress() || getPrivyWalletAddress()) as `0x${string}` | undefined
  const isCrossAppWallet = !!getCrossAppAddress()

  // Debug logging (remove in production)
  // useEffect(() => {
  //   console.log('🔍 useFlayToken Debug:')
  //   console.log('- Final address used:', address)
  //   console.log('- Is cross-app wallet:', isCrossAppWallet)
  // }, [address, isCrossAppWallet])

  // Get FLAY token balance on Base chain
  const { 
    data: flayBalance, 
    isLoading: flayLoading, 
    error: flayError,
    refetch: refetchFlayBalance 
  } = useReadContract({
    address: FLAY_TOKEN.address,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: 8453, // Base chain
    query: {
      enabled: Boolean(address && authenticated),
    },
  })

  // Get ETH balance on Base chain for potential swapping
  const { data: ethBalance, refetch: refetchEthBalance } = useBalance({
    address,
    chainId: 8453, // Base chain
    query: {
      enabled: Boolean(address && authenticated),
    },
  })

  // Calculate if user has enough FLAY
  const flayAmount = flayBalance ? Number(formatUnits(flayBalance, FLAY_TOKEN.decimals)) : 0
  const hasEnoughFlay = flayAmount >= FLAY_TOKEN.minBalance
  const flayDeficit = Math.max(FLAY_TOKEN.minBalance - flayAmount, 0)

  // Get FLAY price in USD
  const getFlayPriceUSD = async () => {
    if (!address) return 0

    try {
      // Use a small ETH amount to get the FLAY/ETH rate, then convert to USD
      const priceParams = new URLSearchParams({
        chainId: '8453',
        sellToken: 'ETH',
        buyToken: FLAY_TOKEN.address,
        sellAmount: '1000000000000000000', // 1 ETH
        taker: address,
      })

      const response = await fetch(`/api/0x/quote?${priceParams}`)
      if (!response.ok) return 0

      const quote = await response.json()
      const flayPerEth = Number(quote.buyAmount) / 1e18
      
      // Rough ETH price estimate (you could fetch from a price API for accuracy)
      const ethPriceUSD = 3400 // Update this to fetch from a real price API
      const flayPriceUSD = ethPriceUSD / flayPerEth
      
      setFlayPriceUSD(flayPriceUSD)
      return flayPriceUSD
    } catch (error) {
      console.error('Error getting FLAY price:', error)
      return 0
    }
  }

  // Manual refresh function
  const refreshBalances = async () => {
    console.log('🔄 Manually refreshing FLAY and ETH balances...')
    await Promise.all([
      refetchFlayBalance(),
      refetchEthBalance(),
      getFlayPriceUSD()
    ])
  }

  // Get FLAY price on load
  useEffect(() => {
    if (address && authenticated) {
      getFlayPriceUSD()
    }
  }, [address, authenticated])

  // Get 0x quote for buying FLAY tokens - follows the correct process:
  // 1. Find cost of 1 FLAY token
  // 2. Calculate ETH needed for deficit amount
  // 3. Get quote ensuring minimum result gives 100 total FLAY
  const getBuyQuote = async (sellToken: string = 'ETH', sellAmount?: string, flayDeficit: number = FLAY_TOKEN.minBalance) => {
    if (!address) {
      console.error('No wallet address')
      return null
    }

    setLoadingQuote(true)

    try {
      // Step 1: Find FLAY/ETH rate using a small sellAmount (since buyAmount doesn't work)
      console.log('🔍 Step 1: Finding FLAY/ETH exchange rate...')
      const testEthAmount = '1000000000000000' // 0.001 ETH for price discovery
      
      const priceParams = new URLSearchParams({
        chainId: '8453',
        sellToken: sellToken === 'ETH' ? 'ETH' : sellToken,
        buyToken: FLAY_TOKEN.address,
        sellAmount: testEthAmount, // Use sellAmount, not buyAmount!
        taker: address,
      })

      const priceResponse = await fetch(`/api/0x/quote?${priceParams}`)
      if (!priceResponse.ok) {
        const error = await priceResponse.json()
        throw new Error(`Price discovery error: ${error.error || error.message}`)
      }

      const priceQuote = await priceResponse.json()
      const flayFromTestEth = Number(priceQuote.buyAmount) / 1e18
      const flayPerEth = flayFromTestEth / 0.001 // Rate: FLAY per 1 ETH
      console.log(`💰 Step 1 Result: Rate is ${flayPerEth.toFixed(1)} FLAY per 1 ETH`)

      // Step 2: Calculate ETH needed for deficit amount (with 10% buffer for slippage)
      const ethNeeded = Math.floor((flayDeficit / flayPerEth) * 1.1 * 1e18).toString()
      const ethNeededReadable = Number(ethNeeded) / 1e18
      console.log(`🧮 Step 2: Need ${ethNeededReadable} ETH for ${flayDeficit} FLAY (with 10% buffer)`)

      // Step 3: Get actual quote with calculated ETH amount
      console.log('🔍 Step 3: Getting executable quote...')
      const actualAmount = sellAmount || ethNeeded
      
      const quoteParams = new URLSearchParams({
        chainId: '8453',
        sellToken: sellToken === 'ETH' ? 'ETH' : sellToken,
        buyToken: FLAY_TOKEN.address,
        sellAmount: actualAmount,
        taker: address,
      })

      const response = await fetch(`/api/0x/quote?${quoteParams}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Quote API error: ${error.error || error.message}`)
      }

      const quote = await response.json()
      const flayReceived = Number(quote.buyAmount) / 1e18
      const ethSpent = Number(quote.sellAmount) / 1e18
      console.log(`✅ Step 3 Result: ${ethSpent} ETH → ${flayReceived} FLAY`)
      
      // Step 4: Validate minimum result gives 100 total FLAY
      const currentBalance = flayBalance ? Number(flayBalance) / 1e18 : 0 // User's current FLAY balance
      const totalAfterPurchase = currentBalance + flayReceived
      
      if (totalAfterPurchase < 100) {
        console.warn(`⚠️ Warning: Total would be ${totalAfterPurchase} FLAY, need 100 total`)
        quote.insufficientAmount = true
        quote.flayShortfall = 100 - totalAfterPurchase
      } else {
        console.log(`✅ Success: Total will be ${totalAfterPurchase} FLAY (≥100 required)`)
        quote.insufficientAmount = false
      }
      
      setBuyQuote(quote)
      return quote
    } catch (error) {
      console.error('Error fetching 0x quote:', error)
      setBuyQuote({
        error: true,
        message: error instanceof Error ? error.message : 'Failed to get quote',
        suggestions: [
          'Ensure you have enough ETH for gas fees',
          'Try refreshing the page and reconnecting',
          'Check if the Base network is selected',
          'Use one of the external DEX links below'
        ]
      })
      return null
    } finally {
      setLoadingQuote(false)
    }
  }

  // Execute buy transaction using cross-app account
  const executeBuyTransaction = async () => {
    if (!buyQuote?.transaction || !address) {
      console.error('No transaction data or address available')
      return null
    }

    if (!isCrossAppWallet) {
      throw new Error('FLAY token purchases require connection through the Flaunch app. Please login through Flaunch first.')
    }

    try {
      console.log('🚀 Executing transaction through cross-app account...')
      
      const txHash = await sendCrossAppTransaction(
        {
          to: buyQuote.transaction.to as `0x${string}`,
          data: buyQuote.transaction.data as `0x${string}`,
          value: buyQuote.transaction.value || '0x0',
          chainId: 8453, // Base chain
        },
        {
          address: address // Use embedded wallet address
        }
      )

      console.log('✅ Cross-app transaction sent:', txHash)
      return txHash
    } catch (error) {
      console.error('❌ Transaction failed:', error)
      throw error
    }
  }

  return {
    // FLAY Token Info
    flayBalance: flayAmount,
    hasEnoughFlay,
    flayDeficit,
    flayLoading,
    flayError,
    
    // User Balances
    ethBalance: ethBalance?.value ? Number(formatUnits(ethBalance.value, 18)) : 0,
    
    // 0x API
    buyQuote,
    loadingQuote,
    getBuyQuote,
    
    // Actions
    refreshBalances,
    executeBuyTransaction,
    
    // Wallet Info
    address,
    isConnected: authenticated && !!address,
    
    // Price Info
    flayPriceUSD,
    flayDeficitUSD: flayDeficit * flayPriceUSD,
  }
}