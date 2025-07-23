import { NextRequest, NextResponse } from 'next/server'

// 0x API proxy route - Based on official 0x demo app structure
// https://0x-swap-v2-demo-app.vercel.app/
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  // Extract query parameters
  const chainId = searchParams.get('chainId')
  const sellToken = searchParams.get('sellToken')
  const buyToken = searchParams.get('buyToken')
  const buyAmount = searchParams.get('buyAmount')
  const sellAmount = searchParams.get('sellAmount')
  const taker = searchParams.get('taker')

  // Validate required parameters
  if (!chainId || !sellToken || !buyToken || !taker) {
    return NextResponse.json(
      { error: 'Missing required parameters: chainId, sellToken, buyToken, taker' },
      { status: 400 }
    )
  }

  if (!buyAmount && !sellAmount) {
    return NextResponse.json(
      { error: 'Either buyAmount or sellAmount must be specified' },
      { status: 400 }
    )
  }

  // Check for API key (match official demo naming)
  const apiKey = process.env.NEXT_PUBLIC_ZEROEX_API_KEY || process.env.ZEROEX_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: '0x API key not configured' },
      { status: 500 }
    )
  }

  try {
    // Handle token address normalization for common cases
    const modifiedParams = new URLSearchParams(searchParams)
    
    if (sellToken === 'ETH') {
      modifiedParams.set('sellToken', '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE')
    } else if (sellToken === 'USDC') {
      if (chainId === '8453') {
        // USDC on Base
        modifiedParams.set('sellToken', '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913')
      } else {
        // USDC on mainnet  
        modifiedParams.set('sellToken', '0xA0b86a33E6441d49ffD09c1a37BF6C1ee13e9F4F')
      }
    }

    // Use the newer Permit2 endpoint (matches official 0x demo)
    const zxApiUrl = `https://api.0x.org/swap/permit2/quote?${modifiedParams.toString()}`
    
    console.log('🔄 Proxying 0x API request:', zxApiUrl)
    console.log('📋 Parameters:', Object.fromEntries(modifiedParams))

    // Make the request to 0x API
    const response = await fetch(zxApiUrl, {
      headers: {
        '0x-api-key': apiKey,
        '0x-version': 'v2',
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ 0x API Error:', response.status, errorText)
      
      // Handle specific error cases
      if (response.status === 404) {
        const isBase = chainId === '8453'
        return NextResponse.json(
          { 
            error: 'No trading route found',
            message: isBase 
              ? 'This token may have insufficient liquidity on Base chain DEXs.'
              : 'This token may have insufficient liquidity or may not be available on this network.',
            suggestions: isBase ? [
              'FLAY token may not have sufficient liquidity on Base DEXs yet',
              'Try buying FLAY directly on Uniswap V3 Base',
              'Check Aerodrome or other Base DEXs for FLAY liquidity',
              'Verify the token contract address is correct on Base',
              'Consider bridging assets to Base first'
            ] : [
              'Check if the token exists on a different blockchain (Base, Polygon, etc.)',
              'Verify the token contract address is correct',
              'The token may have very low liquidity on DEXs',
              'Try a smaller amount if liquidity is limited'
            ],
            chainId,
            apiUrl: zxApiUrl,
            details: errorText 
          },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { 
          error: `0x API Error: ${response.status}`,
          details: errorText 
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ 0x API Success:', data)

    // Return the data with proper CORS headers
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })

  } catch (error) {
    console.error('❌ Proxy Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quote from 0x API' },
      { status: 500 }
    )
  }
}

// Handle preflight OPTIONS request
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
} 