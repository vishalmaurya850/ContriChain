"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, ExternalLink, Share2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { claimFundsOnChain, claimRefundOnChain } from "@/lib/contract-utils"
import { JsonRpcProvider } from "ethers"
import type { Campaign } from "@/lib/models/types"

interface CampaignDetailsProps {
  campaign: Campaign
}

export function CampaignDetails({ campaign }: CampaignDetailsProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()
  const { data: session } = useSession()

  const raisedAmount = campaign.raised
  const goalAmount = campaign.goal
  const progress = Math.min(Math.round((raisedAmount / goalAmount) * 100), 100)

  const isOwner = session?.user?.id === campaign.userId
  const isEnded = new Date(campaign.deadline * 1000) < new Date()
  const isSuccessful = raisedAmount >= goalAmount
  const canClaimFunds = isOwner && isEnded && isSuccessful && !campaign.claimed
  const canClaimRefund = isEnded && !isSuccessful && campaign.status !== "refunded"

  const handleClaimFunds = async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask not detected",
        description: "Please install MetaMask to claim funds",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      const provider = new JsonRpcProvider(window.ethereum)
      await window.ethereum.request({ method: "eth_requestAccounts" })

      await claimFundsOnChain(provider, campaign.onChainId)

      // Update campaign status in database
      await fetch(`/api/campaigns/${campaign._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "completed",
          claimed: true,
        }),
      })

      toast({
        title: "Funds claimed",
        description: "The funds have been transferred to your wallet",
      })

      // Refresh the page to show updated status
      window.location.reload()
    } catch (error) {
      console.error("Error claiming funds:", error)
      toast({
        title: "Failed to claim funds",
        description: "There was an error claiming the funds. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClaimRefund = async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask not detected",
        description: "Please install MetaMask to claim refund",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      const provider = new JsonRpcProvider(window.ethereum)
      await window.ethereum.request({ method: "eth_requestAccounts" })

      await claimRefundOnChain(provider, campaign.onChainId)

      toast({
        title: "Refund claimed",
        description: "Your contribution has been refunded to your wallet",
      })
    } catch (error) {
      console.error("Error claiming refund:", error)
      toast({
        title: "Failed to claim refund",
        description: "There was an error claiming the refund. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: campaign.title,
          text: `Check out this campaign: ${campaign.title}`,
          url: window.location.href,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      // Fallback to copying the URL
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied",
        description: "Campaign link copied to clipboard",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-lg h-[300px] md:h-[400px]">
        <Image
          src={campaign.imageUrl || "/placeholder.svg?height=400&width=800"}
          alt={campaign.title}
          fill
          className="object-cover"
        />
        {campaign.status !== "active" && (
          <div className="absolute top-4 right-4">
            <Badge variant={campaign.status === "completed" ? "default" : "secondary"} className="text-sm px-3 py-1">
              {campaign.status === "completed" ? "Successful" : campaign.status}
            </Badge>
          </div>
        )}
      </div>

      <div>
        <h1 className="text-3xl font-bold">{campaign.title}</h1>
        <div className="flex items-center mt-2 text-muted-foreground">
          <span>by {campaign.userName}</span>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-3xl font-bold">{raisedAmount} ETH</p>
                <p className="text-muted-foreground">raised of {goalAmount} ETH goal</p>
              </div>
              <p className="text-xl font-bold">{progress}%</p>
            </div>

            <Progress value={progress} className="h-2" />

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {isEnded ? "Ended on " : "Ends on "}
                  {new Date(campaign.deadline * 1000).toLocaleDateString()}
                </span>
              </div>

              {!isEnded && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{Math.ceil((campaign.deadline * 1000 - Date.now()) / (1000 * 60 * 60 * 24))} days left</span>
                </div>
              )}

              <div className="flex items-center gap-1 text-muted-foreground ml-auto">
                <a
                  href={`https://etherscan.io/tx/${campaign.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:text-foreground"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View on Etherscan
                </a>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button onClick={handleShare} variant="outline" size="sm" className="flex items-center gap-1">
                <Share2 className="h-4 w-4" />
                Share
              </Button>

              {canClaimFunds && (
                <Button onClick={handleClaimFunds} disabled={isProcessing} className="ml-auto">
                  {isProcessing ? "Processing..." : "Claim Funds"}
                </Button>
              )}

              {canClaimRefund && (
                <Button onClick={handleClaimRefund} disabled={isProcessing} variant="outline" className="ml-auto">
                  {isProcessing ? "Processing..." : "Claim Refund"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="prose dark:prose-invert max-w-none">
        <h2>About this campaign</h2>
        <p>{campaign.description}</p>
      </div>
    </div>
  )
}