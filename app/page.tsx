'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePrivy } from '@privy-io/react-auth'
import { PrivyAuthButton } from '@/components/PrivyAuthButton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FlayTokenGate } from '@/components/FlayTokenGate'
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
  Edit3
} from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const { authenticated, ready, user } = usePrivy()
  const [crossAppAccount, setCrossAppAccount] = useState<CrossAppAccount | null>(null)
  const [showWalletOverride, setShowWalletOverride] = useState(false)
  const [overrideAddress, setOverrideAddress] = useState('')

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

  // Handle successful FLAY token validation
  const handleFlaySuccess = () => {
    if (embeddedWalletAddress) {
      router.push(`/positions/${embeddedWalletAddress}`)
    }
  }

  // Handle wallet override
  const handleWalletOverride = () => {
    if (overrideAddress.trim()) {
      router.push(`/positions/${overrideAddress.trim()}`)
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
          
          {/* Dashboard Access */}
          <div className="max-w-md mx-auto mb-8">
            {!ready ? (
              <Card className="border-2 border-gray-200 bg-gray-50/50">
                <CardContent className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Initializing...</p>
                </CardContent>
              </Card>
            ) : !authenticated || !embeddedWalletAddress ? (
              <Card className="border-2 border-blue-200 bg-blue-50/50">
                <CardContent className="p-8 text-center">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Welcome to Flaunch Dashboard</h3>
                  <p className="text-sm text-blue-600 mb-4">
                    Please connect your Flaunch wallet to continue
                  </p>
                  <PrivyAuthButton className="minimal" />
                </CardContent>
              </Card>
            ) : (
              <FlayTokenGate onSuccess={handleFlaySuccess}>
                <Card className="border-2 border-green-200 bg-green-50/50">
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Shield className="h-6 w-6 text-green-600" />
                      <span className="text-lg font-semibold text-green-800">Access Granted</span>
                    </div>
                    <p className="text-sm text-green-700 mb-4">
                      FLAY token requirement satisfied ✅
                    </p>
                    <div className="space-y-3">
                      <Button 
                        onClick={() => router.push(`/positions/${embeddedWalletAddress}`)}
                        className="bg-green-600 hover:bg-green-700 w-full"
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Your Positions
                      </Button>
                      <Button 
                        onClick={() => setShowWalletOverride(!showWalletOverride)}
                        variant="outline"
                        className="w-full"
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        View Another Wallet
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </FlayTokenGate>
            )}
          </div>

          {/* Wallet Override Interface */}
          {showWalletOverride && (
            <Card className="max-w-md mx-auto mt-6 border-blue-200 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="text-blue-800">View Any Wallet</CardTitle>
                <CardDescription className="text-blue-600">
                  Enter any wallet address to view their positions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Input
                    type="text"
                    placeholder="0x1234567890abcdef1234567890abcdef12345678"
                    value={overrideAddress}
                    onChange={(e) => setOverrideAddress(e.target.value)}
                    className="w-full"
                  />
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleWalletOverride} 
                      disabled={!overrideAddress.trim()}
                      className="flex-1"
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      View Positions
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowWalletOverride(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
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

        {/* FLAY Token Requirement */}
        <Card className="max-w-4xl mx-auto border-orange-200 bg-orange-50/50">
          <CardHeader className="text-center">
            <CardTitle className="text-orange-800">FLAY Token Powered</CardTitle>
            <CardDescription className="text-orange-700">
              This dashboard requires 100 FLAY tokens for access - ensuring our community gets premium analytics tools.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4">
                <Zap className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <h3 className="font-semibold text-orange-800">Exclusive Access</h3>
                <p className="text-sm text-orange-700">Premium features for FLAY holders</p>
              </div>
              <div className="p-4">
                <Shield className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <h3 className="font-semibold text-orange-800">Community Driven</h3>
                <p className="text-sm text-orange-700">Built for the Flaunch ecosystem</p>
              </div>
              <div className="p-4">
                <Target className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <h3 className="font-semibold text-orange-800">Pro Analytics</h3>
                <p className="text-sm text-orange-700">Institutional-grade insights</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}