"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useSearchParams } from "next/navigation"
import { getAllCampaigns } from "@/lib/campaign-service"
import type { Campaign } from "@/lib/models/types"

export function CampaignGrid() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()

  const category = searchParams.get("category")
  const status = searchParams.get("status")
  const minFunding = searchParams.get("minFunding")
  const nearlyFunded = searchParams.get("nearlyFunded") === "true"
  const endingSoon = searchParams.get("endingSoon") === "true"

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true)
      try {
        const allCampaigns = await getAllCampaigns({
          category: category || undefined,
          status: status || undefined,
        })

        // Apply client-side filters
        let filteredCampaigns = [...allCampaigns]

        if (minFunding) {
          filteredCampaigns = filteredCampaigns.filter((c) => c.raised >= Number(minFunding))
        }

        if (nearlyFunded) {
          filteredCampaigns = filteredCampaigns.filter((c) => {
            const progress = (c.raised / c.goal) * 100
            return progress >= 80
          })
        }

        if (endingSoon) {
          const nowInSeconds = Math.floor(Date.now() / 1000)
          const sevenDaysInSeconds = 7 * 24 * 60 * 60
          filteredCampaigns = filteredCampaigns.filter((c) => c.deadline - nowInSeconds <= sevenDaysInSeconds)
        }

        setCampaigns(filteredCampaigns)
      } catch (error) {
        console.error("Error fetching campaigns:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCampaigns()
  }, [category, status, minFunding, nearlyFunded, endingSoon])

  if (loading) {
    return <p>Loading campaigns...</p>
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium">No campaigns found</h3>
        <p className="text-muted-foreground mt-2">Try adjusting your filters or create your own campaign</p>
        <Link href="/create" className="mt-4 inline-block">
          <Button>Create Campaign</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {campaigns.map((campaign) => {
        const raisedAmount = campaign.raised
        const goalAmount = campaign.goal
        const progress = Math.min(Math.round((raisedAmount / goalAmount) * 100), 100)

        return (
          <Card key={campaign._id?.toString()} className="overflow-hidden flex flex-col">
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
              <CardDescription>by {campaign.userName}</CardDescription>
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
              <Link href={`/campaigns/${campaign._id}`} className="w-full">
                <Button className="w-full">View Campaign</Button>
              </Link>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}

