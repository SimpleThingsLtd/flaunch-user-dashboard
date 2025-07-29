'use client'

import { usePrivy, useWallets } from '@privy-io/react-auth'
import { Button } from '@/components/ui/button'
import { LogIn, LogOut, Wallet } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { CrossAppAccount } from '@privy-io/react-auth'

interface PrivyAuthButtonProps {
  className?: string
}

export function PrivyAuthButton({ className }: PrivyAuthButtonProps) {
  const isMinimal = className?.includes('minimal')
  const { login, logout, ready, authenticated, user } = usePrivy()
  const { wallets } = useWallets()
  const [crossAppAccount, setCrossAppAccount] = useState<CrossAppAccount | null>(null)

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

  // Debug logging (remove in production)
  // useEffect(() => {
  //   console.log('🔍 PrivyAuthButton - Final address:', finalAddress, 'Is cross-app:', isCrossAppConnected)
  // }, [finalAddress, isCrossAppConnected])

  // Loading state
  if (!ready) {
    return (
      <Button disabled className={className}>
        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2" />
        Loading...
      </Button>
    )
  }

  // Not authenticated - show Privy login
  if (!authenticated) {
    return (
      <Button 
        onClick={login}
        className={`bg-blue-600 hover:bg-blue-700 ${className}`}
      >
        <LogIn className="h-4 w-4 mr-2" />
        Login with Flaunch
      </Button>
    )
  }

  // Authenticated with a wallet
  if (authenticated && finalAddress) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-green-600 mb-2">
          <Wallet className="h-4 w-4" />
          <span>Connected: {finalAddress.slice(0, 6)}...{finalAddress.slice(-4)}</span>
        </div>
        <div className="text-xs text-center mb-2">
          {isCrossAppConnected ? (
            <span className="text-green-600">
              
            </span>
          ) : (
            <span className="text-orange-600">🔄 Regular Privy Wallet</span>
          )}
        </div>
        {!isCrossAppConnected && (
          <div className="text-xs text-orange-600 text-center mb-2">
            For FLAY purchases, please login through Flaunch app
          </div>
        )}
        <Button 
          onClick={logout}
          variant="outline"
          size="sm"
          className="text-red-600 border-red-200 hover:bg-red-50 w-full"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    )
  }

  // Authenticated but no wallet available
  if (authenticated && !finalAddress) {
    return (
      <div className="space-y-3">
        <div className="text-center">
          <p className="text-sm text-orange-600 mb-2">⚠️ Setting up wallet...</p>
          <p className="text-xs text-muted-foreground mb-3">Please wait or try logging in through Flaunch</p>
        </div>
        <Button 
          onClick={logout}
          variant="outline"
          size="sm"
          className="text-red-600 border-red-200 hover:bg-red-50 w-full"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  // Fallback - show logout option
  return (
    <div className="space-y-3">
      <div className="text-center">
        <p className="text-sm text-green-600 mb-2">✅ Authenticated with Privy</p>
        <p className="text-xs text-muted-foreground mb-3">Setting up wallet...</p>
      </div>
      <Button 
        onClick={logout}
        variant="outline"
        size="sm"
        className="text-red-600 border-red-200 hover:bg-red-50 w-full"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </Button>
    </div>
  )
}