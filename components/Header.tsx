'use client'

import { usePrivy, useWallets } from '@privy-io/react-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogOut, Wallet, Edit3, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CrossAppAccount } from '@privy-io/react-auth'

export function Header() {
  const { logout, authenticated, user } = usePrivy()
  const { wallets } = useWallets()
  const router = useRouter()
  const [crossAppAccount, setCrossAppAccount] = useState<CrossAppAccount | null>(null)
  const [showWalletSwitcher, setShowWalletSwitcher] = useState(false)
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

  // Get wallet addresses
  const crossAppWalletAddress = crossAppAccount?.embeddedWallets?.[0]?.address
  const regularPrivyWallet = wallets.find(wallet => wallet.walletClientType === 'privy')
  const regularWalletAddress = regularPrivyWallet?.address
  
  const finalAddress = crossAppWalletAddress || regularWalletAddress
  const isCrossAppConnected = !!crossAppWalletAddress

  // Handle wallet switching
  const handleWalletSwitch = () => {
    if (overrideAddress.trim()) {
      router.push(`/positions/${overrideAddress.trim()}`)
      setShowWalletSwitcher(false)
      setOverrideAddress('')
    }
  }

  // Don't show header if not authenticated
  if (!authenticated || !finalAddress) {
    return null
  }

  return (
    <>
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo/Title */}
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Flaunch Dashboard
              </h1>
            </div>

            {/* Wallet Info */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Wallet className="h-4 w-4 text-gray-500" />
                <div className="text-right">
                  <div className="font-medium">
                    {finalAddress.slice(0, 6)}...{finalAddress.slice(-4)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {isCrossAppConnected ? (
                      <span className="text-green-600">✅ Flaunch Wallet</span>
                    ) : (
                      <span className="text-orange-600">🔄 Privy Wallet</span>
                    )}
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={() => setShowWalletSwitcher(!showWalletSwitcher)}
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Edit3 className="h-4 w-4 mr-1" />
                Switch
              </Button>
              
              <Button 
                onClick={logout}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Disconnect
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Wallet Switcher Dropdown */}
      {showWalletSwitcher && (
        <div className="border-b bg-blue-50/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <Card className="max-w-md mx-auto border-blue-200 bg-white/90">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-blue-800 text-base">Switch Wallet View</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowWalletSwitcher(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription className="text-blue-600 text-sm">
                  View any wallet's positions while staying connected
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <Input
                    type="text"
                    placeholder="0x1234567890abcdef1234567890abcdef12345678"
                    value={overrideAddress}
                    onChange={(e) => setOverrideAddress(e.target.value)}
                    className="w-full text-sm"
                  />
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleWalletSwitch} 
                      disabled={!overrideAddress.trim()}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      size="sm"
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      View Positions
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => router.push(`/positions/${finalAddress}`)}
                      size="sm"
                    >
                      Your Wallet
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  )
}