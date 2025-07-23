'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { FlayTokenGate } from '@/components/FlayTokenGate'
import { Position, PositionsResponse } from '@/types/position'
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils'
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart,
  Wallet,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Target,
  BarChart2,
  Activity,
  Edit3,
  Shield
} from 'lucide-react'

export default function PositionsPage() {
  const params = useParams()
  const { address: connectedAddress, isConnected } = useAccount()
  const walletAddress = params.wallet as string
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingProgress, setLoadingProgress] = useState<string>('')
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
  const [expandedPositions, setExpandedPositions] = useState<Set<string>>(new Set())
  const [positionDetails, setPositionDetails] = useState<{[key: string]: any}>({})
  const [loadingDetails, setLoadingDetails] = useState<Set<string>>(new Set())
  
  // Wallet override functionality
  const [showWalletOverride, setShowWalletOverride] = useState(false)
  const [overrideAddress, setOverrideAddress] = useState('')
  const [showFlayGate, setShowFlayGate] = useState(true)
  
  const isViewingConnectedWallet = isConnected && connectedAddress?.toLowerCase() === walletAddress.toLowerCase()
  const isViewingDifferentWallet = isConnected && connectedAddress?.toLowerCase() !== walletAddress.toLowerCase()

  const copyToClipboard = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address)
      setCopiedAddress(address)
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopiedAddress(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const togglePositionExpansion = async (tokenAddress: string) => {
    const newExpanded = new Set(expandedPositions)
    
    if (expandedPositions.has(tokenAddress)) {
      // Collapse
      newExpanded.delete(tokenAddress)
    } else {
      // Expand and load details
      newExpanded.add(tokenAddress)
      await loadPositionDetails(tokenAddress)
    }
    
    setExpandedPositions(newExpanded)
  }

  const loadPositionDetails = async (tokenAddress: string) => {
    if (positionDetails[tokenAddress]) return // Already loaded
    
    const loadingSet = new Set(loadingDetails)
    loadingSet.add(tokenAddress)
    setLoadingDetails(loadingSet)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      
      // Fetch detailed position data including transaction history
      const response = await fetch(`${apiUrl}/v1/base/users/${walletAddress}/positions/${tokenAddress}`, {
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Enhanced analytics calculations
        const transactions = data.debug?.poolSwaps || []
        const currentPosition = positions.find(p => p.tokenAddress === tokenAddress)
        
        // Calculate advanced metrics
        const calculateAdvancedMetrics = () => {
          const sortedTxs = [...transactions].sort((a, b) => parseInt(a.timestamp) - parseInt(b.timestamp))
          
          // 1. Position Building Analysis
          const totalInvested = parseFloat(data.pnl?.totalInvested?.usdc || '0')
          const avgBuySize = totalInvested / transactions.length
          const entryPrices = sortedTxs.map(tx => {
            const ethAmount = Math.abs(parseFloat(tx.ethAmountFormatted))
            const tokenAmount = Math.abs(parseFloat(tx.tokenAmountFormatted))
            return ethAmount / tokenAmount
          })
          
          // 2. Risk & Concentration Metrics
          const positionSizePercent = parseFloat(data.position?.positionSizePercentage || '0')
          const concentrationRisk = positionSizePercent > 10 ? 'HIGH' : positionSizePercent > 5 ? 'MEDIUM' : 'LOW'
          const tokenAgeSeconds = data.token?.ageSeconds || 0
          const tokenMaturityScore = tokenAgeSeconds > 2592000 ? 'MATURE' : tokenAgeSeconds > 604800 ? 'DEVELOPING' : 'NEW'
          
          // 3. Performance Breakdown
          const bestEntry = entryPrices.reduce((min, price, idx) => price < entryPrices[min] ? idx : min, 0)
          const worstEntry = entryPrices.reduce((max, price, idx) => price > entryPrices[max] ? idx : max, 0)
          
          // Calculate P&L per transaction batch
          const txBatches = sortedTxs.reduce((acc, tx) => {
            const date = new Date(parseInt(tx.timestamp) * 1000).toDateString()
            if (!acc[date]) acc[date] = []
            acc[date].push(tx)
            return acc
          }, {} as any)
          
          // 4. Market Context
          const marketCap = parseFloat(data.token?.marketCapUSDC || '0')
          const volume24h = data.priceHistory?.[0]?.volumeUSDC ? parseFloat(data.priceHistory[0].volumeUSDC) : 0
          const volumeToMcapRatio = marketCap > 0 ? (volume24h / marketCap) * 100 : 0
          const totalSupply = parseFloat(data.token?.totalSupply || '0')
          const holdingPercent = totalSupply > 0 ? (parseFloat(data.position?.balanceFormatted || '0') / (totalSupply / 1e18)) * 100 : 0
          
          // 5. Advanced Insights
          const currentValue = parseFloat(data.pnl?.currentValueUSDC || '0')
          const unrealizedPnl = parseFloat(data.pnl?.unrealizedPnL?.usdc || '0')
          const taxImplications = unrealizedPnl > 1000 ? 'SIGNIFICANT' : unrealizedPnl > 100 ? 'MODERATE' : 'LOW'
          
          // Price volatility (from price history)
          const priceHistory = data.priceHistory || []
          let volatility = 'UNKNOWN'
          if (priceHistory.length >= 3) {
            const prices = priceHistory.map((p: any) => parseFloat(p.priceUSDC))
            const avgPrice = prices.reduce((a: number, b: number) => a + b) / prices.length
            const variance = prices.reduce((acc: number, price: number) => acc + Math.pow(price - avgPrice, 2), 0) / prices.length
            const stdDev = Math.sqrt(variance)
            const cv = avgPrice > 0 ? (stdDev / avgPrice) * 100 : 0
            volatility = cv > 50 ? 'HIGH' : cv > 25 ? 'MEDIUM' : 'LOW'
          }
          
          return {
            positionBuilding: {
              avgBuySize,
              totalBuys: transactions.length,
              entryPrices,
              dcaEffectiveness: entryPrices.length > 1 ? 'ACTIVE_DCA' : 'SINGLE_ENTRY',
              timePeriod: transactions.length > 0 ? 
                Math.floor((parseInt(sortedTxs[sortedTxs.length - 1].timestamp) - parseInt(sortedTxs[0].timestamp)) / 86400) : 0
            },
            riskMetrics: {
              concentrationRisk,
              positionSizePercent,
              tokenMaturityScore,
              tokenAgeSeconds,
              diversificationNeeded: positionSizePercent > 20
            },
            performance: {
              bestEntryIndex: bestEntry,
              worstEntryIndex: worstEntry,
              bestEntryPrice: entryPrices[bestEntry],
              worstEntryPrice: entryPrices[worstEntry],
              txBatches: Object.keys(txBatches).length,
              sameDay: sortedTxs.filter(tx => 
                new Date(parseInt(tx.timestamp) * 1000).toDateString() === 
                new Date(parseInt(sortedTxs[sortedTxs.length - 1].timestamp) * 1000).toDateString()
              ).length
            },
            marketContext: {
              marketCap,
              volume24h,
              volumeToMcapRatio,
              holdingPercent,
              marketCapGrowth: priceHistory.length > 1 ? 
                ((marketCap - parseFloat(priceHistory[priceHistory.length - 1]?.marketCapUSDC || '0')) / parseFloat(priceHistory[priceHistory.length - 1]?.marketCapUSDC || '1')) * 100 : 0,
              volatility
            },
            advancedInsights: {
              taxImplications,
              exitStrategy: currentValue > totalInvested * 5 ? 'CONSIDER_PARTIAL_EXIT' : 
                          currentValue > totalInvested * 2 ? 'CONSIDER_PROFIT_TAKING' : 'HODL',
              riskReward: unrealizedPnl / totalInvested,
              liquidityRisk: volume24h < marketCap * 0.01 ? 'HIGH' : volume24h < marketCap * 0.05 ? 'MEDIUM' : 'LOW'
            }
          }
        }
        
        const advancedMetrics = calculateAdvancedMetrics()
        
        // Parse the real API data structure with enhanced analytics
        const parsedData = {
          transactions: transactions.map((swap: any, index: number) => ({
            id: index.toString(),
            blockNumber: 'N/A',
            transactionHash: swap.txHash,
            timestamp: new Date(parseInt(swap.timestamp) * 1000).toISOString(),
            type: swap.type.toUpperCase(),
            tokenAmount: Math.abs(parseFloat(swap.tokenAmountFormatted)).toFixed(6),
            pricePerToken: swap.type === 'Buy' ? 
              (Math.abs(parseFloat(swap.ethAmountFormatted)) / Math.abs(parseFloat(swap.tokenAmountFormatted))).toFixed(8) :
              (Math.abs(parseFloat(swap.ethAmountFormatted)) / Math.abs(parseFloat(swap.tokenAmountFormatted))).toFixed(8),
            totalCost: swap.type === 'Buy' ? Math.abs(parseFloat(swap.ethAmountFormatted)).toFixed(6) : null,
            totalReceived: swap.type === 'Sell' ? Math.abs(parseFloat(swap.ethAmountFormatted)).toFixed(6) : null,
            gasFee: 'N/A'
          })) || [],
          analytics: {
            avgEntryPrice: data.position?.avgCostPerTokenUSDC || data.pnl?.unrealizedPnL?.averageCostBasis || '0.00',
            totalInvested: data.pnl?.totalInvested?.usdc || '0.00',
            totalRealized: data.pnl?.totalProceeds?.usdc || '0.00', 
            realizedPnL: data.pnl?.realizedPnL?.usdc || '0.00',
            unrealizedPnL: data.pnl?.unrealizedPnL?.usdc || '0.00',
            holdingPeriod: (() => {
              if (data.timeline?.positionCreated) {
                const transactions = data.debug?.poolSwaps || []
                if (transactions.length > 0) {
                  const earliestTx = transactions.reduce((earliest: any, tx: any) => 
                    parseInt(tx.timestamp) < parseInt(earliest.timestamp) ? tx : earliest
                  )
                  const startTime = parseInt(earliestTx.timestamp) * 1000
                  const now = Date.now()
                  const timeDiff = now - startTime
                  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
                  
                  if (timeDiff < 0) {
                    return 'Recent (timestamp issue)'
                  } else if (daysDiff > 730) {
                    return 'N/A (check timestamp)'
                  } else if (daysDiff === 0) {
                    const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60))
                    return hoursDiff > 0 ? `${hoursDiff} hours` : 'Less than 1 hour'
                  } else {
                    return `${daysDiff} days`
                  }
                }
              }
              
              if (data.timeline?.positionAgeSeconds && data.timeline.positionAgeSeconds < 31536000) {
                return `${Math.floor(data.timeline.positionAgeSeconds / 86400)} days`
              }
              
              return 'N/A'
            })(),
            transactionCount: data.pnl?.transactionCount || data.debug?.poolSwaps?.length || 0
          },
          priceHistory: data.priceHistory || [],
          advanced: advancedMetrics
        }
        
        setPositionDetails(prev => ({
          ...prev,
          [tokenAddress]: parsedData
        }))
      } else {
        // Fallback with mock data if detailed data isn't available
        setPositionDetails(prev => ({
          ...prev,
          [tokenAddress]: generateMockTransactionData(tokenAddress)
        }))
      }
    } catch (err) {
      console.error('Failed to load position details:', err)
      // Fallback with mock data
      setPositionDetails(prev => ({
        ...prev,
        [tokenAddress]: generateMockTransactionData(tokenAddress)
      }))
    }

    const updatedLoadingSet = new Set(loadingDetails)
    updatedLoadingSet.delete(tokenAddress)
    setLoadingDetails(updatedLoadingSet)
  }

  const generateMockTransactionData = (tokenAddress: string) => {
    // Mock data until your API supports transaction history
    return {
      transactions: [
        {
          id: '1',
          blockNumber: '18123456',
          transactionHash: '0xabc123...',
          timestamp: '2024-01-15T10:30:00Z',
          type: 'BUY',
          tokenAmount: '1000.0',
          pricePerToken: '0.001',
          totalCost: '1.0',
          gasFee: '0.002'
        },
        {
          id: '2',
          blockNumber: '18987654',
          transactionHash: '0xdef456...',
          timestamp: '2024-02-20T14:15:00Z',
          type: 'BUY',
          tokenAmount: '500.0',
          pricePerToken: '0.002',
          totalCost: '1.0',
          gasFee: '0.0025'
        },
        {
          id: '3',
          blockNumber: '19456789',
          transactionHash: '0xghi789...',
          timestamp: '2024-03-10T09:45:00Z',
          type: 'SELL',
          tokenAmount: '200.0',
          pricePerToken: '0.003',
          totalReceived: '0.6',
          gasFee: '0.003'
        }
      ],
      analytics: {
        avgEntryPrice: '0.00133',
        totalInvested: '2.0045',
        totalRealized: '0.597',
        realizedPnL: '-1.4075',
        unrealizedPnL: '0.234',
        holdingPeriod: '89 days',
        transactionCount: 3
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Handle wallet override
  const handleWalletOverride = () => {
    if (overrideAddress.trim()) {
      window.location.href = `/positions/${overrideAddress.trim()}`
    }
  }

  const handleFlaySuccess = () => {
    setShowFlayGate(false)
  }

  useEffect(() => {
    const fetchAllPositions = async () => {
      try {
        setLoading(true)
        setLoadingProgress('Fetching positions...')
        
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        const limit = 50
        let offset = 0
        let allPositions: Position[] = []
        let page = 1
        const maxPages = 20 // Reduced safety limit
        let consecutiveEmptyPages = 0
        let lastPositionCount = 0

        console.log('🚀 Starting pagination fetch...')

        // Loop through all pages to get complete position data
        while (page <= maxPages) {
          setLoadingProgress(`Fetching page ${page} (offset: ${offset})...`)
          console.log(`📄 Fetching page ${page}, offset=${offset}`)
          
          const response = await fetch(`${apiUrl}/v1/base/users/${walletAddress}/positions?limit=${limit}&offset=${offset}`, {
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          
          if (!response.ok) {
            if (response.status === 404) {
              console.log('❌ 404 - No positions found')
              throw new Error('Wallet not found or has no positions')
            } else if (response.status === 500) {
              throw new Error('Server error occurred')
            } else {
              throw new Error(`API error: ${response.status}`)
            }
          }
          
          const data: PositionsResponse = await response.json()
          console.log(`📊 Page ${page} response:`, {
            returned: data.data?.length || 0,
            limit,
            offset,
            totalSoFar: allPositions.length
          })
          
          // Validate the response structure
          if (!data || !Array.isArray(data.data)) {
            console.log('❌ Invalid response structure')
            throw new Error('Invalid API response format')
          }
          
          // If no positions returned, increment empty page counter
          if (data.data.length === 0) {
            consecutiveEmptyPages++
            console.log(`🚫 Empty page ${page} (consecutive: ${consecutiveEmptyPages})`)
            
            // Stop after 2 consecutive empty pages
            if (consecutiveEmptyPages >= 2) {
              console.log('🛑 Stopping: 2+ consecutive empty pages')
              break
            }
          } else {
            consecutiveEmptyPages = 0 // Reset counter
          }
          
          // Check for duplicate positions (indicates we're looping)
          const beforeCount = allPositions.length
          const newPositions = data.data.filter(pos => 
            !allPositions.some(existing => existing.tokenAddress === pos.tokenAddress)
          )
          console.log(`🔍 New unique positions: ${newPositions.length} out of ${data.data.length}`)
          
          // If no new unique positions for 3 consecutive pages, stop
          if (newPositions.length === 0) {
            consecutiveEmptyPages++
            console.log(`🔄 No new positions on page ${page} (consecutive: ${consecutiveEmptyPages})`)
            if (consecutiveEmptyPages >= 2) {
              console.log('🛑 Stopping: No new unique positions')
              break
            }
          }
          
          allPositions = [...allPositions, ...newPositions]
          
          // If we got fewer results than requested, this is likely the last page
          if (data.data.length < limit) {
            console.log(`🏁 Got ${data.data.length} positions (less than limit ${limit}), stopping`)
            break
          }
          
          // Check if we're making progress
          if (allPositions.length === lastPositionCount) {
            consecutiveEmptyPages++
            console.log(`⚠️ No progress: still have ${allPositions.length} positions`)
            if (consecutiveEmptyPages >= 2) {
              console.log('🛑 Stopping: No progress being made')
              break
            }
          } else {
            consecutiveEmptyPages = 0
            lastPositionCount = allPositions.length
          }
          
          offset += limit
          page++
          
          // Add a delay to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 200))
        }
        
        if (page > maxPages) {
          console.warn(`⚠️ Stopped at max pages limit (${maxPages}) to prevent infinite loop`)
        }
        
        console.log(`✅ Pagination complete: ${allPositions.length} total positions`)
        setLoadingProgress(`Loaded ${allPositions.length} positions total`)
        setPositions(allPositions)
      } catch (err) {
        setError('Failed to fetch positions')
        console.error('❌ Error fetching positions:', err)
      } finally {
        setLoading(false)
        setLoadingProgress('')
      }
    }

    if (walletAddress) {
      fetchAllPositions()
    }
  }, [walletAddress])

  const calculateOverallStats = () => {
    const totalValue = positions.reduce((sum, pos) => sum + parseFloat(pos.pnl.currentValueUSDC), 0)
    const profitablePositions = positions.filter(pos => pos.pnl.isProfit).length
    const totalPositions = positions.length
    const avgReturn = totalPositions > 0 ? positions.reduce((sum, pos) => sum + parseFloat(pos.pnl.percentageReturn), 0) / totalPositions : 0
    
    return {
      totalValue,
      profitablePositions,
      totalPositions,
      avgReturn,
      profitPercentage: totalPositions > 0 ? (profitablePositions / totalPositions) * 100 : 0
    }
  }

  const stats = calculateOverallStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading positions...</p>
          {loadingProgress && (
            <p className="text-sm text-slate-500 mt-2">{loadingProgress}</p>
          )}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">{error}</p>
            <Link href="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show FLAY gate if viewing connected wallet and haven't passed gate
  if (isViewingConnectedWallet && showFlayGate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Link href="/">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
          <FlayTokenGate onSuccess={handleFlaySuccess} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
            <Link href="/">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            
            {/* Wallet Connection Status & Override */}
            <div className="flex items-center gap-4">
              {isConnected ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="text-green-700">
                      Connected: {connectedAddress?.slice(0, 6)}...{connectedAddress?.slice(-4)}
                    </span>
                  </div>
                  
                  {/* Wallet Override */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowWalletOverride(!showWalletOverride)}
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    Override Wallet
                  </Button>
                </div>
              ) : (
                <ConnectButton />
              )}
            </div>
          </div>

          {/* Wallet Override Interface */}
          {showWalletOverride && (
            <Card className="mb-6 border-blue-200 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="text-blue-800">Override Wallet Address</CardTitle>
                <CardDescription className="text-blue-600">
                  View any wallet's positions while staying connected to yours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="0x1234567890abcdef1234567890abcdef12345678"
                    value={overrideAddress}
                    onChange={(e) => setOverrideAddress(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleWalletOverride} disabled={!overrideAddress.trim()}>
                    View Positions
                  </Button>
                  <Button variant="outline" onClick={() => setShowWalletOverride(false)}>
                    Cancel
                  </Button>
                </div>
                {isViewingDifferentWallet && (
                  <div className="mt-3 p-3 bg-orange-100 rounded-lg">
                    <p className="text-sm text-orange-800">
                      You're viewing a different wallet than your connected one. Your wallet connection remains active.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          <div className="flex items-center gap-4 mb-6">
            <div className="p-2 bg-primary rounded-full">
              <Wallet className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Portfolio Overview</h1>
              <div className="flex items-center gap-2">
                <p className="text-slate-600 font-mono text-sm">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </p>
                {isViewingDifferentWallet && (
                  <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                    Override
                  </span>
                )}
              </div>
              {positions.length > 0 && (
                <p className="text-sm text-slate-500 mt-1">
                  Showing all {positions.length} positions
                </p>
              )}
            </div>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Positions</p>
                    <p className="text-2xl font-bold">{stats.totalPositions}</p>
                  </div>
                  <PieChart className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Profitable</p>
                    <p className="text-2xl font-bold">{stats.profitablePositions}/{stats.totalPositions}</p>
                    <p className="text-xs text-muted-foreground">
                      ({formatPercentage(stats.profitPercentage)})
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Return</p>
                    <p className={`text-2xl font-bold ${stats.avgReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatPercentage(stats.avgReturn)}
                    </p>
                  </div>
                  {stats.avgReturn >= 0 ? (
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  ) : (
                    <TrendingDown className="h-8 w-8 text-red-500" />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Positions List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Your Positions
            {positions.length > 0 && (
              <span className="text-lg text-slate-500 ml-2">({positions.length})</span>
            )}
          </h2>
          
          {positions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">No positions found</p>
                <p className="text-sm text-muted-foreground">This wallet doesn't have any active positions.</p>
              </CardContent>
            </Card>
          ) : (
            positions.map((position) => {
              const isExpanded = expandedPositions.has(position.tokenAddress)
              const details = positionDetails[position.tokenAddress]
              const isLoadingDetails = loadingDetails.has(position.tokenAddress)
              
              return (
                <Card key={position.tokenAddress} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div 
                      className="flex items-start justify-between cursor-pointer"
                      onClick={() => togglePositionExpansion(position.tokenAddress)}
                    >
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                          {position.image ? (
                            <img
                              src={position.image}
                              alt={`${position.symbol} logo`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback to letter avatar if image fails to load
                                e.currentTarget.style.display = 'none'
                                const parent = e.currentTarget.parentElement
                                if (parent) {
                                  parent.innerHTML = position.symbol.charAt(0)
                                  parent.className = "w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0"
                                }
                              }}
                            />
                          ) : (
                            position.symbol.charAt(0)
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{position.symbol}</h3>
                            <span className="text-sm text-muted-foreground">•</span>
                            <span className="text-sm text-muted-foreground">{position.name}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                copyToClipboard(position.tokenAddress)
                              }}
                              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-muted"
                              title="Click to copy full address"
                            >
                              <span className="font-mono">
                                {formatAddress(position.tokenAddress)}
                              </span>
                              {copiedAddress === position.tokenAddress ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Holdings</p>
                              <p className="font-semibold">{formatNumber(parseFloat(position.balanceFormatted))}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Current Value</p>
                              <p className="font-semibold">{formatCurrency(parseFloat(position.pnl.currentValueUSDC))}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Position Size</p>
                              <p className="font-semibold">{formatPercentage(parseFloat(position.positionSizePercentage))}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">PnL</p>
                              <div className="flex items-center gap-1">
                                {position.pnl.isProfit ? (
                                  <TrendingUp className="h-4 w-4 text-green-500" />
                                ) : (
                                  <TrendingDown className="h-4 w-4 text-red-500" />
                                )}
                                <p className={`font-semibold ${position.pnl.isProfit ? 'text-green-500' : 'text-red-500'}`}>
                                  {formatPercentage(parseFloat(position.pnl.percentageReturn))}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(`https://flaunch.gg/base/coin/${position.tokenAddress}`, '_blank')
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t">
                        {isLoadingDetails ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            <span className="ml-2 text-sm text-muted-foreground">Loading details...</span>
                          </div>
                        ) : details ? (
                          <div className="space-y-6">
                            {/* Risk & Concentration Warning */}
                            {details.advanced?.riskMetrics && (
                              <div className={`p-4 rounded-lg border-l-4 ${
                                details.advanced.riskMetrics.concentrationRisk === 'HIGH' ? 'bg-red-50 border-red-500' :
                                details.advanced.riskMetrics.concentrationRisk === 'MEDIUM' ? 'bg-yellow-50 border-yellow-500' :
                                'bg-green-50 border-green-500'
                              }`}>
                                <div className="flex items-start gap-3">
                                  <div className={`p-1 rounded-full ${
                                    details.advanced.riskMetrics.concentrationRisk === 'HIGH' ? 'bg-red-100' :
                                    details.advanced.riskMetrics.concentrationRisk === 'MEDIUM' ? 'bg-yellow-100' :
                                    'bg-green-100'
                                  }`}>
                                    <PieChart className={`h-4 w-4 ${
                                      details.advanced.riskMetrics.concentrationRisk === 'HIGH' ? 'text-red-600' :
                                      details.advanced.riskMetrics.concentrationRisk === 'MEDIUM' ? 'text-yellow-600' :
                                      'text-green-600'
                                    }`} />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-sm">
                                      {details.advanced.riskMetrics.concentrationRisk} Portfolio Concentration
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      This position represents {details.advanced.riskMetrics.positionSizePercent.toFixed(1)}% of the token holdings.
                                      {details.advanced.riskMetrics.diversificationNeeded && 
                                        ' Consider diversification to reduce risk.'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Position Building Analysis */}
                            {details.advanced?.positionBuilding && (
                              <div>
                                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                  <Target className="h-5 w-5 text-blue-500" />
                                  Position Building Strategy
                                </h4>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                  <Card className="p-3">
                                    <div className="text-center">
                                      <p className="text-2xl font-bold text-blue-600">
                                        {details.advanced.positionBuilding.totalBuys}
                                      </p>
                                      <p className="text-xs text-muted-foreground">Total Buys</p>
                                    </div>
                                  </Card>
                                  <Card className="p-3">
                                    <div className="text-center">
                                      <p className="text-2xl font-bold text-green-600">
                                        {formatCurrency(details.advanced.positionBuilding.avgBuySize)}
                                      </p>
                                      <p className="text-xs text-muted-foreground">Avg Buy Size</p>
                                    </div>
                                  </Card>
                                  <Card className="p-3">
                                    <div className="text-center">
                                      <p className="text-2xl font-bold text-purple-600">
                                        {details.advanced.positionBuilding.timePeriod}
                                      </p>
                                      <p className="text-xs text-muted-foreground">Days DCA</p>
                                    </div>
                                  </Card>
                                  <Card className="p-3">
                                    <div className="text-center">
                                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                        details.advanced.positionBuilding.dcaEffectiveness === 'ACTIVE_DCA' ? 
                                        'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                      }`}>
                                        {details.advanced.positionBuilding.dcaEffectiveness}
                                      </span>
                                    </div>
                                  </Card>
                                </div>
                              </div>
                            )}

                            {/* Performance Breakdown */}
                            {details.advanced?.performance && (
                              <div>
                                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                  <TrendingUp className="h-5 w-5 text-green-500" />
                                  Entry Performance Analysis
                                </h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  <Card className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-medium text-green-600">Best Entry</span>
                                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                        #{details.advanced.performance.bestEntryIndex + 1}
                                      </span>
                                    </div>
                                    <p className="text-lg font-bold">
                                      {(details.advanced.performance.bestEntryPrice * 1e12).toFixed(8)} ETH
                                    </p>
                                  </Card>
                                  
                                  <Card className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-medium text-red-600">Highest Entry</span>
                                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                        #{details.advanced.performance.worstEntryIndex + 1}
                                      </span>
                                    </div>
                                    <p className="text-lg font-bold">
                                      {(details.advanced.performance.worstEntryPrice * 1e12).toFixed(8)} ETH
                                    </p>
                                  </Card>
                                </div>
                                
                                {details.advanced.performance.sameDay > 1 && (
                                  <div className="bg-blue-50 p-3 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                      <strong>Strategy Note:</strong> {details.advanced.performance.sameDay} purchases made on the same day. 
                                      This suggests active position building during price movement.
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Market Context */}
                            {details.advanced?.marketContext && (
                              <div>
                                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                  <BarChart2 className="h-5 w-5 text-purple-500" />
                                  Market Context & Token Health
                                </h4>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <Card className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <DollarSign className="h-4 w-4 text-blue-500" />
                                      <span className="text-sm font-medium">Market Cap</span>
                                    </div>
                                    <p className="text-lg font-bold">
                                      {formatCurrency(details.advanced.marketContext.marketCap)}
                                    </p>
                                    {details.advanced.marketContext.marketCapGrowth !== 0 && (
                                      <p className={`text-xs ${details.advanced.marketContext.marketCapGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {details.advanced.marketContext.marketCapGrowth > 0 ? '↗' : '↘'} 
                                        {Math.abs(details.advanced.marketContext.marketCapGrowth).toFixed(1)}%
                                      </p>
                                    )}
                                  </Card>
                                  
                                  <Card className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Activity className="h-4 w-4 text-green-500" />
                                      <span className="text-sm font-medium">Vol/MCap</span>
                                    </div>
                                    <p className="text-lg font-bold">
                                      {details.advanced.marketContext.volumeToMcapRatio.toFixed(2)}%
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {(() => {
                                        const lastDataTimestamp = details.priceHistory?.[0]?.timestamp
                                        if (lastDataTimestamp) {
                                          const timeDiff = Date.now() - (parseInt(lastDataTimestamp) * 1000)
                                          const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
                                          if (daysDiff === 0) {
                                            return details.advanced.marketContext.volumeToMcapRatio > 5 ? 'High Activity' : 
                                                   details.advanced.marketContext.volumeToMcapRatio > 1 ? 'Moderate Activity' : 'Low Activity'
                                          } else if (daysDiff === 1) {
                                            return `Data from 1 day ago`
                                          } else {
                                            return `Data from ${daysDiff} days ago`
                                          }
                                        }
                                        return 'Activity Level Unknown'
                                      })()}
                                    </p>
                                  </Card>
                                  
                                  <Card className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <PieChart className="h-4 w-4 text-purple-500" />
                                      <span className="text-sm font-medium">Your Share</span>
                                    </div>
                                    <p className="text-lg font-bold">
                                      {details.advanced.marketContext.holdingPercent > 0.01 ? 
                                        details.advanced.marketContext.holdingPercent.toFixed(3) : 
                                        '< 0.001'}%
                                    </p>
                                    <p className="text-xs text-muted-foreground">of supply</p>
                                  </Card>
                                  
                                  <Card className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Activity className="h-4 w-4 text-orange-500" />
                                      <span className="text-sm font-medium">Volatility</span>
                                    </div>
                                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                      details.advanced.marketContext.volatility === 'HIGH' ? 'bg-red-100 text-red-800' :
                                      details.advanced.marketContext.volatility === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                      details.advanced.marketContext.volatility === 'LOW' ? 'bg-green-100 text-green-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {details.advanced.marketContext.volatility}
                                    </span>
                                  </Card>
                                </div>
                              </div>
                            )}

                            {/* Exit Strategy & Advanced Insights */}
                            {details.advanced?.advancedInsights && (
                              <div>
                                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                  <Target className="h-5 w-5 text-indigo-500" />
                                  Strategic Insights & Recommendations
                                </h4>
                                
                                <div className="space-y-4">
                                  {/* Exit Strategy Recommendation */}
                                  <Card className="p-4">
                                    <div className="flex items-start gap-3">
                                      <div className={`p-2 rounded-full ${
                                        details.advanced.advancedInsights.exitStrategy === 'CONSIDER_PARTIAL_EXIT' ? 'bg-orange-100' :
                                        details.advanced.advancedInsights.exitStrategy === 'CONSIDER_PROFIT_TAKING' ? 'bg-blue-100' :
                                        'bg-green-100'
                                      }`}>
                                        <TrendingUp className={`h-4 w-4 ${
                                          details.advanced.advancedInsights.exitStrategy === 'CONSIDER_PARTIAL_EXIT' ? 'text-orange-600' :
                                          details.advanced.advancedInsights.exitStrategy === 'CONSIDER_PROFIT_TAKING' ? 'text-blue-600' :
                                          'text-green-600'
                                        }`} />
                                      </div>
                                      <div className="flex-1">
                                        <h5 className="font-semibold text-sm">Exit Strategy</h5>
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {details.advanced.advancedInsights.exitStrategy === 'CONSIDER_PARTIAL_EXIT' && 
                                            'Consider taking partial profits. Your position has grown significantly (5x+).'}
                                          {details.advanced.advancedInsights.exitStrategy === 'CONSIDER_PROFIT_TAKING' && 
                                            'Consider taking some profits. Your position has doubled (2x+).'}
                                          {details.advanced.advancedInsights.exitStrategy === 'HODL' && 
                                            'Current strategy: Hold and continue monitoring. Position hasn\'t reached typical profit-taking levels.'}
                                        </p>
                                        <div className="mt-2">
                                          <span className="text-xs font-medium">Risk/Reward Ratio: </span>
                                          <span className={`text-xs font-bold ${
                                            details.advanced.advancedInsights.riskReward > 10 ? 'text-green-600' :
                                            details.advanced.advancedInsights.riskReward > 2 ? 'text-blue-600' :
                                            'text-yellow-600'
                                          }`}>
                                            {details.advanced.advancedInsights.riskReward.toFixed(2)}x
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </Card>
                                  
                                  {/* Additional Risk Factors */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card className="p-4">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Activity className="h-4 w-4 text-red-500" />
                                        <span className="text-sm font-medium">Liquidity Risk</span>
                                      </div>
                                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                        details.advanced.advancedInsights.liquidityRisk === 'HIGH' ? 'bg-red-100 text-red-800' :
                                        details.advanced.advancedInsights.liquidityRisk === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-green-100 text-green-800'
                                      }`}>
                                        {details.advanced.advancedInsights.liquidityRisk}
                                      </span>
                                      <p className="text-xs text-muted-foreground mt-2">
                                        Based on 24h volume vs market cap ratio
                                      </p>
                                    </Card>
                                    
                                    <Card className="p-4">
                                      <div className="flex items-center gap-2 mb-2">
                                        <DollarSign className="h-4 w-4 text-blue-500" />
                                        <span className="text-sm font-medium">Tax Planning</span>
                                      </div>
                                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                        details.advanced.advancedInsights.taxImplications === 'SIGNIFICANT' ? 'bg-red-100 text-red-800' :
                                        details.advanced.advancedInsights.taxImplications === 'MODERATE' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-green-100 text-green-800'
                                      }`}>
                                        {details.advanced.advancedInsights.taxImplications}
                                      </span>
                                      <p className="text-xs text-muted-foreground mt-2">
                                        {details.advanced.advancedInsights.taxImplications === 'SIGNIFICANT' && 
                                          'Consider tax implications of large gains'}
                                        {details.advanced.advancedInsights.taxImplications === 'MODERATE' && 
                                          'Monitor tax implications as position grows'}
                                        {details.advanced.advancedInsights.taxImplications === 'LOW' && 
                                          'Tax implications currently minimal'}
                                      </p>
                                    </Card>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Analytics Overview (original cards) */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <Card className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Target className="h-4 w-4 text-blue-500" />
                                  <span className="text-sm font-medium">Avg Entry</span>
                                </div>
                                <p className="text-lg font-bold">{formatCurrency(parseFloat(details.analytics.avgEntryPrice))}</p>
                              </Card>
                              
                              <Card className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Activity className="h-4 w-4 text-green-500" />
                                  <span className="text-sm font-medium">Realized PnL</span>
                                </div>
                                <p className={`text-lg font-bold ${parseFloat(details.analytics.realizedPnL) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                  {formatCurrency(parseFloat(details.analytics.realizedPnL))}
                                </p>
                              </Card>
                              
                              <Card className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <BarChart2 className="h-4 w-4 text-purple-500" />
                                  <span className="text-sm font-medium">Unrealized PnL</span>
                                </div>
                                <p className={`text-lg font-bold ${parseFloat(details.analytics.unrealizedPnL) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                  {formatCurrency(parseFloat(details.analytics.unrealizedPnL))}
                                </p>
                              </Card>
                              
                              <Card className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Clock className="h-4 w-4 text-orange-500" />
                                  <span className="text-sm font-medium">Hold Period</span>
                                </div>
                                <p className="text-lg font-bold">{details.analytics.holdingPeriod}</p>
                              </Card>
                            </div>

                            {/* Transaction History */}
                            <div>
                              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Transaction History ({details.analytics.transactionCount})
                              </h4>
                              
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b">
                                      <th className="text-left py-2">Date</th>
                                      <th className="text-left py-2">Type</th>
                                      <th className="text-right py-2">Token Amount</th>
                                      <th className="text-right py-2">ETH Amount</th>
                                      <th className="text-right py-2">Price per Token</th>
                                      <th className="text-center py-2">Tx</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {details.transactions.map((tx: any) => (
                                      <tr key={tx.id} className="border-b">
                                        <td className="py-2">{formatDate(tx.timestamp)}</td>
                                        <td className="py-2">
                                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            tx.type === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                          }`}>
                                            {tx.type}
                                          </span>
                                        </td>
                                        <td className="py-2 text-right font-mono">{formatNumber(parseFloat(tx.tokenAmount))}</td>
                                        <td className="py-2 text-right font-mono">
                                          {tx.type === 'BUY' ? tx.totalCost : tx.totalReceived} ETH
                                        </td>
                                        <td className="py-2 text-right font-mono">{tx.pricePerToken} ETH</td>
                                        <td className="py-2 text-center">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => window.open(`https://basescan.org/tx/${tx.transactionHash}`, '_blank')}
                                          >
                                            <ExternalLink className="h-3 w-3" />
                                          </Button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Investment Summary */}
                            <div className="bg-muted/30 rounded-lg p-4">
                              <h4 className="font-semibold mb-3">Investment Summary</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Total Invested</p>
                                  <p className="font-semibold">{formatCurrency(parseFloat(details.analytics.totalInvested))}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Total Proceeds</p>
                                  <p className="font-semibold">{formatCurrency(parseFloat(details.analytics.totalRealized))}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Net PnL</p>
                                  <p className={`font-semibold ${parseFloat(details.analytics.realizedPnL) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {formatCurrency(parseFloat(details.analytics.realizedPnL))}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Additional metrics if available */}
                              {details.priceHistory && details.priceHistory.length > 0 && (
                                <div className="mt-4 pt-4 border-t">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <p className="text-muted-foreground">Current Market Cap</p>
                                      <p className="font-semibold">
                                        {formatCurrency(parseFloat(details.priceHistory[0]?.marketCapUSDC || '0'))}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">
                                        {(() => {
                                          const lastDataTimestamp = details.priceHistory[0]?.timestamp
                                          if (lastDataTimestamp) {
                                            const timeDiff = Date.now() - (parseInt(lastDataTimestamp) * 1000)
                                            const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
                                            if (daysDiff === 0) {
                                              return 'Recent Volume'
                                            } else if (daysDiff === 1) {
                                              return 'Volume (1 day ago)'
                                            } else {
                                              return `Volume (${daysDiff} days ago)`
                                            }
                                          }
                                          return 'Last Volume'
                                        })()}
                                      </p>
                                      <p className="font-semibold">
                                        {formatCurrency(parseFloat(details.priceHistory[0]?.volumeUSDC || '0'))}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4 text-muted-foreground">
                            No detailed data available
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}