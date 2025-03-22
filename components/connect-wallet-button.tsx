"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Wallet } from "lucide-react"
import { Web3Provider } from "@ethersproject/providers"
import { useSession } from "next-auth/react"

export function ConnectWalletButton() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const { toast } = useToast()
  const { data: session } = useSession()

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
      // Request account access
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
      const address = accounts[0]

      // Create message for signing
      const message = `Connect wallet to CryptoFund: ${Date.now()}`

      const provider = new Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const signature = await signer.signMessage(message)

      // If user is logged in, associate wallet with account
      if (session) {
        const response = await fetch("/api/wallet/connect", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            address,
            signature,
            message,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to connect wallet to account")
        }
      }

      setWalletAddress(address)

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
    setWalletAddress(null)
    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected",
    })
  }

  return (
    <div>
      {!walletAddress ? (
        <Button
          variant="outline"
          size="sm"
          onClick={connectWallet}
          disabled={isConnecting}
          className="flex items-center gap-2"
        >
          <Wallet className="h-4 w-4" />
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
      ) : (
        <Button variant="outline" size="sm" onClick={disconnectWallet} className="flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          {`${walletAddress.substring(0, 4)}...${walletAddress.substring(walletAddress.length - 4)}`}
        </Button>
      )}
    </div>
  )
}

