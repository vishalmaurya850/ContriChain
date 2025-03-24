"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { ExternalLink } from "lucide-react"
import { useCampaignContributions } from "@/lib/contribution-service"

interface CampaignContributorsProps {
  campaignId: string
}

interface Contributor {
  userImage: string
  userName: string
  timestamp: string
  amount: string
  transactionHash: string
}

export function CampaignContributors({ campaignId }: CampaignContributorsProps) {
  const { contributions, isLoading } = useCampaignContributions(campaignId)

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[100px]" />
              </div>
            </div>
          ))}
      </div>
    )
  }

  if (contributions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No contributions yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {contributions.map((contributor: Contributor) => (
      <Card key={contributor.transactionHash}>
        <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={contributor.userImage} />
            <AvatarFallback>{contributor.userName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{contributor.userName}</p>
            <p className="text-sm text-muted-foreground">
            {new Date(contributor.timestamp).toLocaleDateString()}
            </p>
          </div>
          </div>
          <div className="flex items-center space-x-4">
          <p className="font-bold">{contributor.amount} ETH</p>
          <a
            href={`https://etherscan.io/tx/${contributor.transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ExternalLink className="h-4 w-4" />
            <span className="sr-only">View on Etherscan</span>
          </a>
          </div>
        </div>
        </CardContent>
      </Card>
      ))}
    </div>
  )
}

