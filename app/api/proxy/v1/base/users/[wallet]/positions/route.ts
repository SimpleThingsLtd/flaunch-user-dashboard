import { NextRequest, NextResponse } from 'next/server'

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

  try {
    // Forward the request to your actual API server
    const apiUrl = process.env.API_SERVER_URL || 'http://localhost:3001'
    const response = await fetch(`${apiUrl}/v1/base/users/${walletAddress}/positions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Forward any relevant headers from the original request
        ...Object.fromEntries(
          Array.from(request.headers.entries()).filter(([key]) => 
            ['authorization', 'x-api-key'].includes(key.toLowerCase())
          )
        )
      }
    })

    // Forward the response from your API server
    if (!response.ok) {
      return NextResponse.json(
        { error: `API server returned ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to connect to API server' },
      { status: 502 }
    )
  }
} 