"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useFlagsmith } from "@/lib/flagsmith"
import { getCampaigns } from "@/lib/contract-utils"

interface BlockchainCampaign {
  id: string
  title: string
  description: string
  goal: string
  raised: string
  deadline: number
  owner: string
  imageUrl: string
}

export function CampaignList() {
  const [campaigns, setCampaigns] = useState<BlockchainCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const flags = useFlagsmith()
  const maxCampaigns = flags?.getValue("max_displayed_campaigns") || 6

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        const data = await getCampaigns()
        setCampaigns(data.slice(0, Number(maxCampaigns)))
      } catch (error) {
        console.error("Error loading campaigns:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCampaigns()
  }, [maxCampaigns])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
      </div>
    )
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium">No active campaigns found</h3>
        <p className="text-muted-foreground mt-2">Be the first to create a campaign!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {campaigns.map((campaign) => {
        const raisedAmount = Number.parseFloat(campaign.raised)
        const goalAmount = Number.parseFloat(campaign.goal)
        const progress = Math.min(Math.round((raisedAmount / goalAmount) * 100), 100)

        return (
          <Card key={campaign.id} className="overflow-hidden flex flex-col">
            <div className="h-48 overflow-hidden relative">
              <Image
                src={campaign.imageUrl || "/placeholder.svg?height=200&width=400"}
                alt={campaign.title}
                fill
                className="object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle>{campaign.title}</CardTitle>
              <CardDescription>
                by {`${campaign.owner.substring(0, 6)}...${campaign.owner.substring(campaign.owner.length - 4)}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{campaign.description}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{raisedAmount} ETH raised</span>
                  <span>{goalAmount} ETH goal</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {new Date(campaign.deadline * 1000).toLocaleDateString()} deadline
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Contribute</Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}