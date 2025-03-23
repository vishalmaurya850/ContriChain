"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ExternalLink } from "lucide-react"
import { useSession } from "next-auth/react"
import { getUserContributions } from "@/lib/contribution-service"
import type { Contribution } from "@/lib/models/types"

export function UserContributions() {
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()

  useEffect(() => {
    const fetchContributions = async () => {
      if (!session?.user?.id) return

      try {
        const userContributions = await getUserContributions(session.user.id)
        setContributions(userContributions)
      } catch (error) {
        console.error("Error fetching user contributions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchContributions()
  }, [session?.user?.id])

  if (loading) {
    return (
      <div className="space-y-4">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
      </div>
    )
  }

  if (contributions.length === 0) {
    return (
      <Card className="text-center p-6">
        <CardTitle className="mb-2">No Contributions Yet</CardTitle>
        <p className="text-muted-foreground mb-4">You haven&apos;t contributed to any campaigns yet.</p>
        <Link href="/campaigns">
          <Button>Browse Campaigns</Button>
        </Link>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {contributions.map((contribution) => (
        <Card key={contribution._id?.toString()}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <Link href={`/campaigns/${contribution.campaignId}`} className="hover:underline">
                <CardTitle className="text-lg">{contribution.campaignTitle || "Campaign"}</CardTitle>
              </Link>
              <span className="text-lg font-bold">{contribution.amount} ETH</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {new Date(contribution.timestamp).toLocaleDateString()} at{" "}
                {new Date(contribution.timestamp).toLocaleTimeString()}
              </div>
              <a
                href={`https://etherscan.io/tx/${contribution.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                View transaction <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}