"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Wallet } from "lucide-react"
import { useFlagsmith } from "@/lib/flagsmith"

export function ConnectWallet() {
  const [account, setAccount] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const { toast } = useToast()
  const flags = useFlagsmith()
  const isMetamaskEnabled = flags?.isFeatureEnabled("metamask_connection")

  useEffect(() => {
    // Check if wallet is already connected
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          if (accounts.length > 0) {
            setAccount(accounts[0])
          }
        } catch (error) {
          console.error("Error checking connection:", error)
        }
      }
    }

    checkConnection()
  }, [])

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask not detected",
        description: "Please install MetaMask to use this feature",
        variant: "destructive",
      })
      return
    }

    setIsConnecting(true)

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
      setAccount(accounts[0])
      toast({
        title: "Wallet connected",
        description: "Your wallet has been connected successfully",
      })
    } catch (error) {
      console.error("Error connecting wallet:", error)
      toast({
        title: "Connection failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected",
    })
  }

  if (!isMetamaskEnabled) {
    return null
  }

  return (
    <div>
      {!account ? (
        <Button onClick={connectWallet} disabled={isConnecting} className="flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="px-4 py-2 bg-muted rounded-md text-sm">
            {`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}
          </div>
          <Button variant="outline" size="sm" onClick={disconnectWallet}>
            Disconnect
          </Button>
        </div>
      )}
    </div>
  )
}