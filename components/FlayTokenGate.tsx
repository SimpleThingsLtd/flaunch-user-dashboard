'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useFlayToken } from '@/lib/hooks/useFlayToken'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { AlertTriangle, ShoppingCart, ExternalLink, CheckCircle, Copy } from 'lucide-react'

interface FlayTokenGateProps {
  onSuccess?: () => void // Callback when user has enough FLAY
  children?: React.ReactNode // Content to show when user has enough FLAY
}

export function FlayTokenGate({ onSuccess, children }: FlayTokenGateProps) {
  const {
    flayBalance,
    hasEnoughFlay,
    flayDeficit,
    flayDeficitUSD,
    flayLoading,
    ethBalance,
    getBuyQuote,
    buyQuote,
    loadingQuote,
    refreshBalances,
    executeBuyTransaction,
    address,
    isConnected
  } = useFlayToken()

  const [showBuyInterface, setShowBuyInterface] = useState(false)
  const [pendingTx, setPendingTx] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [txSuccess, setTxSuccess] = useState(false)
  const [sendError, setSendError] = useState<Error | null>(null)

  // Refresh balance when transaction succeeds
  useEffect(() => {
    if (txSuccess) {
      console.log('✅ Transaction confirmed! Refreshing FLAY balance...')
      // Refresh balances without reloading the page
      setTimeout(() => {
        refreshBalances()
      }, 2000) // Wait 2 seconds for blockchain to update
    }
  }, [txSuccess, refreshBalances])

  // Call success callback when user has enough FLAY
  useEffect(() => {
    if (hasEnoughFlay && onSuccess) {
      onSuccess()
    }
  }, [hasEnoughFlay, onSuccess])

  // If user has enough FLAY, render children
  if (hasEnoughFlay) {
    return children ? <>{children}</> : null
  }

  // If not connected, this component shouldn't render (handled by parent)
  if (!isConnected) {
    return null
  }

  // Loading state
  if (flayLoading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking FLAY token balance...</p>
        </CardContent>
      </Card>
    )
  }

  const handleBuyFlay = async (customSellAmount?: string) => {
    setShowBuyInterface(true)
    await getBuyQuote('ETH', customSellAmount, flayDeficit)
  }

  const handleDirectBuy = async () => {
    if (!buyQuote?.transaction) {
      console.error('No transaction data available')
      return
    }

    try {
      setIsSending(true)
      setSendError(null)
      
      const hash = await executeBuyTransaction()
      
      if (hash) {
        setPendingTx(hash)
        console.log('🚀 Transaction sent:', hash)
        
        // Wait a bit for transaction to be mined
        setTimeout(() => {
          setTxSuccess(true)
          setIsSending(false)
        }, 3000)
      }
    } catch (error) {
      console.error('❌ Transaction failed:', error)
      setSendError(error as Error)
      setIsSending(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto border-orange-200 bg-orange-50">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <AlertTriangle className="h-6 w-6 text-orange-600" />
          <CardTitle className="text-orange-800">FLAY Token Required</CardTitle>
        </div>
        <CardDescription className="text-orange-700">
          You need at least 100 FLAY tokens on Base chain to access the Flaunch User Dashboard
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Balance */}
        <div className="bg-white rounded-lg p-4 border border-orange-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Current FLAY Balance</p>
              <p className="text-2xl font-bold text-orange-600">
                {formatNumber(flayBalance)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Required</p>
              <p className="text-2xl font-bold text-green-600">100</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min((flayBalance / 100) * 100, 100)}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              You need {formatNumber(flayDeficit)} more FLAY tokens
              {flayDeficitUSD > 0 && (
                <span className="text-green-600 font-medium"> (≈ ${flayDeficitUSD.toFixed(2)})</span>
              )}
            </p>
          </div>
        </div>

        {/* Buy FLAY Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Get FLAY Tokens</h3>
            <Button 
              onClick={() => handleBuyFlay()}
              disabled={loadingQuote}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {loadingQuote ? 'Getting Price...' : 'Get FLAY Quote'}
            </Button>
          </div>

          {ethBalance < 0.01 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                You need some ETH in your wallet to buy FLAY tokens (for gas fees and swapping).
              </p>
            </div>
          )}

          {/* Buy Quote */}
          {buyQuote && !buyQuote.error && (
            <div className="bg-white rounded-lg p-4 border border-orange-200 space-y-3">
              <h4 className="font-semibold">Purchase Quote</h4>
              <p className="text-xs text-muted-foreground mb-2">
                Current balance: {formatNumber(flayBalance ? Number(flayBalance) / 1e18 : 0)} FLAY • Need: {flayDeficit} more
              </p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">You'll Pay</p>
                  <p className="font-bold">
                    {formatNumber(Number(buyQuote.sellAmount) / 1e18)} ETH
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ≈ {formatCurrency(buyQuote.sellAmountUsd || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">You'll Receive</p>
                  <p className="font-bold">
                    {formatNumber(Number(buyQuote.buyAmount) / 1e18)} FLAY
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {buyQuote.insufficientAmount ? 
                      `⚠️ Total would be ${(100 - (buyQuote.flayShortfall || 0)).toFixed(1)}, need ${buyQuote.flayShortfall?.toFixed(1)} more` :
                      `✅ Total will be ${(flayBalance ? Number(flayBalance) / 1e18 : 0) + (Number(buyQuote.buyAmount) / 1e18)} FLAY (≥100 required)`
                    }
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t">
                {buyQuote.insufficientAmount && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                    <p className="text-sm text-yellow-800 font-medium">
                      ⚠️ This quote provides {(Number(buyQuote.buyAmount) / 1e18).toFixed(1)} FLAY
                    </p>
                    <p className="text-xs text-yellow-700">
                      You need {buyQuote.flayShortfall?.toFixed(1)} more FLAY tokens to meet the minimum requirement.
                    </p>
                    <Button 
                      onClick={() => handleBuyFlay(`${Math.floor(Number(buyQuote.sellAmount) * 1.5)}`)}
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Get More FLAY (+50% ETH)
                    </Button>
                  </div>
                )}
                
                {/* Direct Buy Button */}
                <Button 
                  onClick={handleDirectBuy}
                  disabled={isSending || !buyQuote?.transaction}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {isSending ? 'Processing...' : 'Buy Now (In-App)'}
                </Button>
                
                {pendingTx && (
                  <p className="text-xs text-center text-muted-foreground">
                    {txSuccess ? '✅ Transaction confirmed!' : `📝 Transaction: ${pendingTx.slice(0, 10)}...`}
                  </p>
                )}
                
                {sendError && (
                  <p className="text-xs text-center text-red-600">
                    ❌ Transaction failed: {sendError.message}
                  </p>
                )}
                
                <div className="text-center text-xs text-muted-foreground">OR</div>
                
                <Button 
                  onClick={() => window.open(`https://app.uniswap.org/#/swap?inputCurrency=ETH&outputCurrency=${buyQuote.buyToken}&exactAmount=${buyQuote.buyAmount}&exactField=output&chain=base`, '_blank')}
                  variant="outline"
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Buy on Uniswap (Base)
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Opens Uniswap with pre-filled transaction details
                </p>
              </div>
            </div>
          )}

          {/* Quote Error Handling */}
          {buyQuote && buyQuote.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-red-800">Unable to Get Quote</h4>
              <p className="text-sm text-red-700">{buyQuote.message}</p>
              
              {buyQuote.suggestions && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-red-800">Possible solutions:</p>
                  <ul className="text-xs text-red-700 space-y-1">
                    {buyQuote.suggestions.map((suggestion: string, index: number) => (
                      <li key={index}>• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-3 border-t border-red-200 space-y-2">
                <p className="text-sm font-medium text-red-800 mb-2">Try these Base DEXs directly:</p>
                <Button 
                  onClick={() => window.open(`https://app.uniswap.org/#/swap?inputCurrency=ETH&outputCurrency=0xf1a7000000950c7ad8aff13118bb7ab561a448ee&chain=base`, '_blank')}
                  variant="outline"
                  className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  🦄 Uniswap (Base)
                </Button>
                <Button 
                  onClick={() => window.open(`https://aerodrome.finance/swap?from=0x0000000000000000000000000000000000000000&to=0xf1a7000000950c7ad8aff13118bb7ab561a448ee`, '_blank')}
                  variant="outline"
                  className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  ✈️ Aerodrome (Base)
                </Button>
                <Button 
                  onClick={() => window.open(`https://baseswap.fi/swap?inputCurrency=ETH&outputCurrency=0xf1a7000000950c7ad8aff13118bb7ab561a448ee`, '_blank')}
                  variant="outline"
                  className="w-full border-green-300 text-green-700 hover:bg-green-50"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  🔄 BaseSwap
                </Button>
              </div>
            </div>
          )}

          {/* Alternative Methods */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">Alternative Methods</h4>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                • Buy FLAY directly on Base DEXs: Uniswap V3, Aerodrome, BaseSwap
              </p>
              <p className="text-muted-foreground">
                • Transfer FLAY from another wallet on Base chain
              </p>
              <p className="text-muted-foreground">
                • Bridge ETH/USDC to Base first for lower transaction fees
              </p>
              <p className="text-muted-foreground">
                • FLAY may have better liquidity on specific Base-native DEXs
              </p>
              <div className="mt-3 p-2 bg-white rounded border">
                <p className="text-xs text-muted-foreground mb-1">FLAY Token Address:</p>
                <code className="text-xs font-mono break-all bg-gray-100 px-2 py-1 rounded">
                  0xf1a7000000950c7ad8aff13118bb7ab561a448ee
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText('0xf1a7000000950c7ad8aff13118bb7ab561a448ee')}
                  className="ml-2 h-6 px-2"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={refreshBalances}
            className="border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            I've Got FLAY - Check Again
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 