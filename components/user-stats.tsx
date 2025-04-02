"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { useUserCampaigns } from "@/lib/campaign-service"
import { useUserContributions } from "@/lib/contribution-service"
import { useMemo } from "react"

export function UserStats() {
  const { data: session } = useSession()
  const { campaigns, isLoading: campaignsLoading } = useUserCampaigns(session?.user?.id) as { campaigns: { status: string }[]; isLoading: boolean }
  const { contributions, isLoading: contributionsLoading } = useUserContributions(session?.user?.id) as { contributions: { amount: number; campaignId: string }[]; isLoading: boolean }

  const isLoading = campaignsLoading || contributionsLoading

  const stats = useMemo(() => {
    if (isLoading) {
      return {
        totalCampaigns: 0,
        activeCampaigns: 0,
        totalContributed: 0,
        campaignsContributed: 0,
      }
    }

    const activeCampaigns = campaigns.filter((c: { status: string }) => c.status === "active").length
    const totalContributed = contributions.reduce((sum: number, c: { amount: number }) => sum + c.amount, 0)
    const uniqueCampaignIds = new Set(contributions.map((c: { campaignId: string }) => c.campaignId))

    return {
      totalCampaigns: campaigns.length,
      activeCampaigns,
      totalContributed,
      campaignsContributed: uniqueCampaignIds.size,
    }
  }, [campaigns, contributions, isLoading])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/3" />
              </CardContent>
            </Card>
          ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Active Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Contributed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalContributed.toFixed(2)} ETH</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Campaigns Supported</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.campaignsContributed}</div>
        </CardContent>
      </Card>
    </div>
  )
}