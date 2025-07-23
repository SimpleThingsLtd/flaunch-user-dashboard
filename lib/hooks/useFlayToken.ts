'use client'

import { useAccount, useReadContract, useBalance } from 'wagmi'
import { useState, useEffect } from 'react'
import { FLAY_TOKEN } from '@/lib/web3-config'
import { formatUnits } from 'viem'

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
  const { address, isConnected } = useAccount()
  const [buyQuote, setBuyQuote] = useState<any>(null)
  const [loadingQuote, setLoadingQuote] = useState(false)

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
      enabled: Boolean(address && isConnected),
    },
  })

  // Get ETH balance on Base chain for potential swapping
  const { data: ethBalance, refetch: refetchEthBalance } = useBalance({
    address,
    chainId: 8453, // Base chain
    query: {
      enabled: Boolean(address && isConnected),
    },
  })

  // Calculate if user has enough FLAY
  const flayAmount = flayBalance ? Number(formatUnits(flayBalance, FLAY_TOKEN.decimals)) : 0
  const hasEnoughFlay = flayAmount >= FLAY_TOKEN.minBalance
  const flayDeficit = Math.max(FLAY_TOKEN.minBalance - flayAmount, 0)

  // Manual refresh function
  const refreshBalances = async () => {
    console.log('🔄 Manually refreshing FLAY and ETH balances...')
    await Promise.all([
      refetchFlayBalance(),
      refetchEthBalance()
    ])
  }

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
      return null
    } finally {
      setLoadingQuote(false)
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
    
    // Wallet Info
    address,
    isConnected,
  }
} 