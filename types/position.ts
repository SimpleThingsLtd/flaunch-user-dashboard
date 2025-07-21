export interface Position {
  tokenAddress: string
  symbol: string
  name: string
  image: string
  positionManager: string
  balance: string
  balanceFormatted: string
  positionSizePercentage: string
  pnl: {
    currentValueETH: string
    currentValueUSDC: string
    costBasisETH?: string
    unrealizedPnLETH?: string
    percentageReturn: string
    isProfit: boolean
    calculationMethod: string
    realizedPnL?: {
      eth: string
      usdc: string
      details: Array<{
        timestamp: string
        tokensAmount: number
        ethReceived: number
        costBasisETH: number
        profit: number
        txHash: string
      }>
    }
    unrealizedPnL?: {
      eth: string
      usdc: string
      averageCostBasis: string
      currentValue: string
    }
    totalInvested?: {
      eth: string
      usdc: string
    }
    totalProceeds?: {
      eth: string
      usdc: string
    }
    netPnL?: {
      eth: string
      usdc: string
      percentageReturn: string
    }
  }
  token: {
    marketCapETH?: string
    marketCapUSDC?: string
    price: string
    totalSupply: string
  }
  createdAt: number
  updatedAt: number
}

export interface PositionsResponse {
  data: Position[]
  pagination: {
    limit: number
    offset: number
  }
  meta: {
    network: string
    timestamp: number
  }
} 