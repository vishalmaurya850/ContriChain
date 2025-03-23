"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useFlagsmith } from "@/lib/flagsmith"
import { getFeaturedCampaign } from "@/lib/contract-utils"

interface FeaturedCampaign {
  id: string
  title: string
  description: string
  goal: string
  raised: string
  deadline: number
  owner: string
  imageUrl: string
}

export function FeaturedCampaign() {
  const [campaign, setCampaign] = useState<FeaturedCampaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [contribution, setContribution] = useState("0.01")
  const flags = useFlagsmith()
  const isFeaturedEnabled = flags?.isFeatureEnabled("featured_campaign")

  useEffect(() => {
    if (!isFeaturedEnabled) {
      setLoading(false)
      return
    }

    const loadFeaturedCampaign = async () => {
      try {
        const data = await getFeaturedCampaign()
        setCampaign(data)
      } catch (error) {
        console.error("Error loading featured campaign:", error)
      } finally {
        setLoading(false)
      }
    }

    loadFeaturedCampaign()
  }, [isFeaturedEnabled])

  if (!isFeaturedEnabled) {
    return null
  }

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto overflow-hidden">
        <div className="md:flex">
          <Skeleton className="h-64 md:h-auto md:w-1/2" />
          <div className="p-6 md:w-1/2">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-6" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-2 w-full mb-6" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </Card>
    )
  }

  if (!campaign) {
    return null
  }

  const raisedAmount = Number.parseFloat(campaign.raised)
  const goalAmount = Number.parseFloat(campaign.goal)
  const progress = Math.min(Math.round((raisedAmount / goalAmount) * 100), 100)

  return (
    <Card className="w-full max-w-4xl mx-auto overflow-hidden">
      <div className="md:flex">
        <div className="md:w-1/2 relative h-64 md:h-full">
          <Image
            src={campaign.imageUrl || "/placeholder.svg?height=400&width=600"}
            alt={campaign.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-6 md:w-1/2">
          <CardHeader className="p-0 mb-4">
            <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs rounded-full mb-2">
              Featured Campaign
            </div>
            <CardTitle className="text-2xl">{campaign.title}</CardTitle>
            <CardDescription>
              by {`${campaign.owner.substring(0, 6)}...${campaign.owner.substring(campaign.owner.length - 4)}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 mb-6">
            <p className="text-muted-foreground mb-4">{campaign.description}</p>
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
          <CardFooter className="p-0 flex flex-col space-y-4">
            <div className="flex space-x-2 w-full">
              <Input
                type="number"
                value={contribution}
                onChange={(e) => setContribution(e.target.value)}
                min="0.001"
                step="0.001"
                className="max-w-[120px]"
              />
              <span className="flex items-center px-3 bg-muted rounded-md text-sm">ETH</span>
              <Button className="flex-grow">Contribute</Button>
            </div>
          </CardFooter>
        </div>
      </div>
    </Card>
  )
}