'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FlayTokenGate } from '@/components/FlayTokenGate'
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Wallet,
  Shield,
  Zap,
  Target,
  Activity
} from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const [showDashboard, setShowDashboard] = useState(false)

  // Handle successful FLAY token validation
  const handleFlaySuccess = () => {
    if (address) {
      router.push(`/positions/${address}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Flaunch User Dashboard
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Professional crypto portfolio tracking with advanced analytics, risk assessment, and strategic insights.
          </p>
          
          {/* Connect Wallet Section */}
          <div className="max-w-md mx-auto mb-8">
            {!isConnected ? (
              <Card className="border-2 border-blue-200 bg-blue-50/50">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-blue-800">Connect Your Wallet</CardTitle>
                  <CardDescription className="text-blue-600">
                    Connect your wallet to access your crypto positions
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <ConnectButton />
                </CardContent>
              </Card>
            ) : (
              <FlayTokenGate onSuccess={handleFlaySuccess}>
                <Card className="border-2 border-green-200 bg-green-50/50">
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Shield className="h-6 w-6 text-green-600" />
                      <span className="text-lg font-semibold text-green-800">Wallet Connected</span>
                    </div>
                    <p className="text-sm text-green-700 mb-4">
                      Address: {address?.slice(0, 6)}...{address?.slice(-4)}
                    </p>
                    <Button 
                      onClick={() => router.push(`/positions/${address}`)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Dashboard
                    </Button>
                  </CardContent>
                </Card>
              </FlayTokenGate>
            )}
          </div>
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