"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { getUserCampaigns } from "@/lib/campaign-service"
import { getUserContributions } from "@/lib/contribution-service"

export function UserStats() {
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalContributed: 0,
    campaignsContributed: 0,
  })
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()

  useEffect(() => {
    const fetchStats = async () => {
      if (!session?.user?.id) return

      try {
        // Fetch user campaigns
        const campaigns = await getUserCampaigns(session.user.id)
        const activeCampaigns = campaigns.filter((c: any) => c.status === "active").length

        // Fetch user contributions
        const contributions = await getUserContributions(session.user.id)
        const totalContributed = contributions.reduce((sum: number, c: any) => sum + c.amount, 0)

        // Get unique campaigns contributed to
        const uniqueCampaignIds = new Set(contributions.map((c: any) => c.campaignId))

        setStats({
          totalCampaigns: campaigns.length,
          activeCampaigns,
          totalContributed,
          campaignsContributed: uniqueCampaignIds.size,
        })
      } catch (error) {
        console.error("Error fetching user stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [session?.user?.id])

  if (loading) {
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

