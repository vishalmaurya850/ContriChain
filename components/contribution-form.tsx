"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { JsonRpcProvider } from "ethers"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { contributeToChain } from "@/lib/contract-utils"
import type { Campaign } from "@/lib/models/types"

interface ContributionFormProps {
  campaign: Campaign
}

export function ContributionForm({ campaign }: ContributionFormProps) {
  const [amount, setAmount] = useState("0.01")
  const [isContributing, setIsContributing] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()

  const isEnded = new Date(campaign.deadline * 1000) < new Date()

  const handleContribute = async () => {
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to contribute to this campaign",
        variant: "destructive",
      })
      router.push(`/login?callbackUrl=/campaigns/${campaign._id}`)
      return
    }

    if (!window.ethereum) {
      toast({
        title: "MetaMask not detected",
        description: "Please install MetaMask to contribute",
        variant: "destructive",
      })
      return
    }

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid contribution amount",
        variant: "destructive",
      })
      return
    }

    setIsContributing(true)

    try {
      // Connect to provider
      const provider = new JsonRpcProvider(window.ethereum)

      // Request account access
      await window.ethereum.request({ method: "eth_requestAccounts" })

      // Contribute to campaign
      const result = await contributeToChain(provider, campaign.onChainId, Number(amount))

      // Record contribution in database
      const response = await fetch(`/api/campaigns/${campaign._id}/contribute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number(amount),
          transactionHash: result.transactionHash,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to record contribution")
      }

      toast({
        title: "Contribution successful",
        description: `You have successfully contributed ${amount} ETH to this campaign`,
      })

      // Refresh the page to show updated funding
      router.refresh()
    } catch (error) {
      console.error("Error contributing to campaign:", error)
      toast({
        title: "Contribution failed",
        description: "There was an error processing your contribution. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsContributing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Support this campaign</CardTitle>
        <CardDescription>Contribute ETH to help fund this project</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Contribution Amount (ETH)</Label>
            <div className="flex space-x-2">
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0.001"
                step="0.001"
                disabled={isContributing || isEnded}
              />
              <span className="flex items-center px-3 bg-muted rounded-md text-sm">ETH</span>
            </div>
          </div>

          {isEnded ? (
            <p className="text-sm text-destructive">
              This campaign has ended and is no longer accepting contributions.
            </p>
          ) : (
            <Button className="w-full" onClick={handleContribute} disabled={isContributing || isEnded}>
              {isContributing ? "Processing..." : "Contribute"}
            </Button>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start text-sm text-muted-foreground">
        <p>All contributions are made through the Ethereum blockchain.</p>
        <p>Gas fees will apply in addition to your contribution amount.</p>
      </CardFooter>
    </Card>
  )
}