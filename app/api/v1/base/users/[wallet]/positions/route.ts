import { NextRequest, NextResponse } from 'next/server'
import { PositionsResponse } from '@/types/position'

export async function GET(
  request: NextRequest,
  { params }: { params: { wallet: string } }
) {
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
        balance: "181370843112801844234752",
        balanceFormatted: "181370.843112801844234752",
        positionSizePercentage: "0.0002",
        pnl: {
          currentValueETH: "99910571449831",
          currentValueUSDC: "0.346066",
          costBasisETH: "3.322749598335646e+32",
          unrealizedPnLETH: "-3.322749598335646e+32",
          percentageReturn: "-100.00",
          isProfit: false,
          calculationMethod: "last_purchase_price_approximation_fixed"
        },
        token: {
          marketCapETH: "55086346700000000000",
          marketCapUSDC: "190805.6726589343253",
          price: "1815331855609919489524228405",
          totalSupply: "100000000000000000000000000000"
        },
        createdAt: 32934067,
        updatedAt: 32934067
      },
      {
        tokenAddress: "0xf210aba8cdf4f769611b1340e24340825413f61a",
        symbol: "BANDIT",
        name: "Bandit",
        image: "https://images.flaunch.gg/cdn-cgi/image/width=800,height=800,anim=true,format=auto/https://ipfs.flaunch.gg/ipfs/QmeGzNiQ2N67bJsVVhK9MiHM4eyV7qw4zVEGUoKVM9TWj9",
        positionManager: "0xf785bb58059fab6fb19bdda2cb9078d9e546efdc",
        balance: "2187519735694820941786465485",
        balanceFormatted: "2187519735.694820941786465485",
        positionSizePercentage: "2.1875",
        pnl: {
          currentValueETH: "3493792770825512",
          currentValueUSDC: "12.664665",
          costBasisETH: "4.519852924104721e+40",
          unrealizedPnLETH: "-4.519852924104721e+40",
          percentageReturn: "-100.00",
          isProfit: false,
          calculationMethod: "last_purchase_price_approximation_fixed"
        },
        token: {
          marketCapETH: "159714800000000000",
          marketCapUSDC: "578.9508785499684",
          price: "626115843514815536592946643399",
          totalSupply: "100000000000000000000000000000"
        },
        createdAt: 32262907,
        updatedAt: 32262907
      }
    ],
    pagination: { limit: 50, offset: 0 },
    meta: { network: "mainnet", timestamp: Date.now() }
  }

  // Add a small delay to simulate network latency
  await new Promise(resolve => setTimeout(resolve, 500))

  return NextResponse.json(sampleData, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  })
} 