'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePrivy } from '@privy-io/react-auth'
import { PrivyAuthButton } from '@/components/PrivyAuthButton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { CrossAppAccount } from '@privy-io/react-auth'
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Wallet,
  Shield,
  Zap,
  Target,
  Activity,
  Search
} from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const { authenticated, ready, user } = usePrivy()
  const [crossAppAccount, setCrossAppAccount] = useState<CrossAppAccount | null>(null)
  const [walletAddress, setWalletAddress] = useState('')

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

  const embeddedWalletAddress = crossAppAccount?.embeddedWallets?.[0]?.address

  // Handle viewing wallet positions
  const handleViewWallet = (address?: string) => {
    const targetAddress = address || walletAddress.trim()
    if (targetAddress) {
      router.push(`/positions/${targetAddress}`)
    }
  }

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleViewWallet()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Flaunch User Dashboard
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Professional crypto portfolio tracking with advanced analytics, risk assessment, and strategic insights.
          </p>
          
          {/* Main Wallet Input */}
          <Card className="max-w-2xl mx-auto mb-8 border-2 border-blue-200 bg-blue-50/50">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-blue-900">View Portfolio</CardTitle>
              <CardDescription className="text-blue-700">
                Enter any wallet address to view its portfolio or connect your Flaunch wallet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Wallet Address Input */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter wallet address (0x...)"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 text-base"
                  />
                  <Button 
                    onClick={() => handleViewWallet()}
                    disabled={!walletAddress.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    View
                  </Button>
                </div>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-blue-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-blue-50 px-2 text-blue-600">Or</span>
                </div>
              </div>

              {/* Connected Wallet Section */}
              {!ready ? (
                <div className="text-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Initializing...</p>
                </div>
              ) : authenticated && embeddedWalletAddress ? (
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-800">Connected Wallet</span>
                    </div>
                    <p className="text-sm text-green-700 font-mono text-center mb-3">
                      {embeddedWalletAddress.slice(0, 6)}...{embeddedWalletAddress.slice(-4)}
                    </p>
                    <Button 
                      onClick={() => handleViewWallet(embeddedWalletAddress)}
                      className="bg-green-600 hover:bg-green-700 w-full"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View My Positions
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-3">
                    Connect your Flaunch wallet to quickly access your portfolio
                  </p>
                  <PrivyAuthButton className="minimal" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Portfolio Overview</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Total portfolio value and metrics</li>
                <li>• Position size analysis</li>
                <li>• Profit/loss tracking</li>
                <li>• Performance analytics</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Advanced Analytics</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Risk & concentration warnings</li>
                <li>• DCA strategy analysis</li>
                <li>• Entry performance breakdown</li>
                <li>• Exit strategy recommendations</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Smart Insights</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Market context & token health</li>
                <li>• Tax planning insights</li>
                <li>• Liquidity risk assessment</li>
                <li>• Transaction history analysis</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <PieChart className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-lg">Position Cards</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Expandable detailed view</li>
                <li>• Token images and metadata</li>
                <li>• Click-to-copy addresses</li>
                <li>• Blockchain explorer links</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="text-lg">Risk Management</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Portfolio concentration alerts</li>
                <li>• Diversification recommendations</li>
                <li>• Volatility assessments</li>
                <li>• Risk/reward calculations</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Activity className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle className="text-lg">Real-Time Data</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Live API integration</li>
                <li>• Automatic pagination</li>
                <li>• Current market prices</li>
                <li>• Transaction history</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* About Section */}
        <Card className="max-w-4xl mx-auto border-blue-200 bg-blue-50/50">
          <CardHeader className="text-center">
            <CardTitle className="text-blue-900">Professional Portfolio Analytics</CardTitle>
            <CardDescription className="text-blue-700">
              Access institutional-grade portfolio insights for any wallet address on Base chain.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4">
                <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-blue-800">Real-Time Data</h3>
                <p className="text-sm text-blue-700">Live portfolio tracking and updates</p>
              </div>
              <div className="p-4">
                <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-blue-800">Risk Analysis</h3>
                <p className="text-sm text-blue-700">Comprehensive risk assessment tools</p>
              </div>
              <div className="p-4">
                <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-blue-800">Strategic Insights</h3>
                <p className="text-sm text-blue-700">Data-driven investment strategies</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}