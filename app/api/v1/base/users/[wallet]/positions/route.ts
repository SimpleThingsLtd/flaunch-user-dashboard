import { NextRequest, NextResponse } from 'next/server'
import { PositionsResponse } from '@/types/position'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ wallet: string }> }
) {
  const params = await context.params
  const walletAddress = params.wallet

  // Validate wallet address format (basic validation)
  if (!walletAddress || walletAddress.length < 20) {
    return NextResponse.json(
      { error: 'Invalid wallet address' },
      { status: 400 }
    )
  }

  // Sample data for demonstration
  const sampleData: PositionsResponse = {
    data: [
      {
        tokenAddress: "0x0e2708fc2ec41f4bff17968d8213e911574d8203",
        symbol: "ND1",
        name: "New Day 1",
        image: "https://images.flaunch.gg/cdn-cgi/image/width=800,height=800,anim=true,format=auto/https://ipfs.flaunch.gg/ipfs/bafkreicj2w4a3r4klu5zubmlg3x3gy6xglruomrpr7djpslt5etbzhhltq",
        positionManager: "0xf785bb58059fab6fb19bdda2cb9078d9e546efdc",
        balance: "28479222948757291597226322",
        balanceFormatted: "28479222.948757291597226322",
        positionSizePercentage: "0.0285",
        pnl: {
          currentValueETH: "100093447205600",
          currentValueUSDC: "0.362253",
          costBasisETH: "8.189852256022696e+36",
          unrealizedPnLETH: "-8.189852256022696e+36",
          percentageReturn: "-100.00",
          isProfit: false,
          calculationMethod: "last_purchase_price_approximation_fixed"
        },
        token: {
          marketCapETH: "351461300000000000",
          marketCapUSDC: "1271.9898757893355",
          price: "284526330925903581658523296892",
          totalSupply: "100000000000000000000000000000"
        },
        createdAt: 32934089,
        updatedAt: 32934089
      },
      {
        tokenAddress: "0x88fbb146bb61be687301eda2a5d3326be3227a60",
        symbol: "NOBI",
        name: "Nobi Official",
        image: "https://images.flaunch.gg/cdn-cgi/image/width=800,height=800,anim=true,format=auto/https://ipfs.flaunch.gg/ipfs/QmcNziX2FSNYmufqWiGz5vx9GwthSKwmZsEEngjaY81L1V",
        positionManager: "0x51bba15255406cfe7099a42183302640ba7dafdc",
        balance: "10000000000000000000000",
        balanceFormatted: "10000.0",
        positionSizePercentage: "0.3545",
        pnl: {
          currentValueETH: "3545000000000000000",
          currentValueUSDC: "12815.3",
          costBasisETH: "3800000000000000000",
          unrealizedPnLETH: "-255000000000000000",
          percentageReturn: "-6.71",
          isProfit: false,
          calculationMethod: "last_purchase_price_approximation_fixed"
        },
        token: {
          marketCapETH: "35450000000000000000",
          marketCapUSDC: "128153.0",
          price: "354500000000000",
          totalSupply: "100000000000000000000000000"
        },
        createdAt: 32934089,
        updatedAt: 32934089
      },
      {
        tokenAddress: "0x3b2f62d42db19b30588648bf1c184865d4c3b1c6",
        symbol: "BASED",
        name: "BasedPepe",
        image: "https://images.flaunch.gg/cdn-cgi/image/width=800,height=800,anim=true,format=auto/https://ipfs.flaunch.gg/ipfs/QmZMFzpEe7hqxzjQCqV8d4JnKN2TRgzZ9FzAYJ8N6b7d8Q",
        positionManager: "0xa1b2c3d4e5f6789012345678901234567890abcd",
        balance: "5000000000000000000000",
        balanceFormatted: "5000.0",
        positionSizePercentage: "0.1500",
        pnl: {
          currentValueETH: "1500000000000000000",
          currentValueUSDC: "5426.1",
          costBasisETH: "1200000000000000000",
          unrealizedPnLETH: "300000000000000000",
          percentageReturn: "25.00",
          isProfit: true,
          calculationMethod: "last_purchase_price_approximation_fixed"
        },
        token: {
          marketCapETH: "15000000000000000000",
          marketCapUSDC: "54261.0",
          price: "300000000000000",
          totalSupply: "50000000000000000000000000"
        },
        createdAt: 32934089,
        updatedAt: 32934089
      }
    ],
    pagination: { limit: 50, offset: 0 },
    meta: { network: "mainnet", timestamp: Date.now() }
  }

  // Add slight delay to simulate network latency
  await new Promise(resolve => setTimeout(resolve, 500))

  return NextResponse.json(sampleData, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  })
} 