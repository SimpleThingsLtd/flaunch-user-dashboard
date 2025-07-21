'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, TrendingUp, BarChart3 } from 'lucide-react'

export default function Home() {
  const [walletAddress, setWalletAddress] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (walletAddress.trim()) {
      router.push(`/positions/${walletAddress}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary rounded-full">
                <Wallet className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Crypto Positions Tracker
            </h1>
            <p className="text-lg text-slate-600">
              Track your crypto positions, analyze your portfolio performance, and monitor your PnL across all your holdings.
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Enter Your Wallet Address
              </CardTitle>
              <CardDescription>
                Enter your wallet address to view your current positions and portfolio analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="text"
                  placeholder="0x1234567890abcdef1234567890abcdef12345678"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="text-center"
                />
                <Button type="submit" className="w-full" size="lg">
                  View Positions
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <h3 className="font-semibold">PnL Tracking</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Monitor both realized and unrealized gains/losses
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold">Portfolio Overview</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Complete view of all your token positions
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="h-5 w-5 text-purple-500" />
                  <h3 className="font-semibold">Real-time Data</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Live updates on your position values
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 