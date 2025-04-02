"use client"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useUserCampaigns, deleteCampaign } from "@/lib/campaign-service"
import { useToast } from "@/hooks/use-toast"

export function UserCampaigns() {
  const { data: session } = useSession()
  const { campaigns, isLoading, mutate } = useUserCampaigns(session?.user?.id)

  type Campaign = {
    id: string
    title: string
    description: string
    createdAt: string
    status: string
    raised: number
    goal: number
    deadline: number
  }
  const { toast } = useToast()

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm("Are you sure you want to delete this campaign? This action cannot be undone.")) {
      return
    }

    try {
      await deleteCampaign(id)

      // Refresh the campaigns list
      mutate()

      toast({
        title: "Campaign deleted",
        description: "Your campaign has been deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting campaign:", error)
      toast({
        title: "Failed to delete campaign",
        description: "There was an error deleting your campaign. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array(2)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-2 w-full mb-2" />
                <Skeleton className="h-2 w-3/4" />
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
      <Card className="text-center p-6">
        <>
          <CardDescription className="mb-4">You haven&apos;t created any campaigns yet.</CardDescription>
          <Link href="/create">
            <Button>Create Your First Campaign</Button>
          </Link>
        </>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {campaigns.map((campaign: Campaign) => {
        const raisedAmount = campaign.raised
        const goalAmount = campaign.goal
        const progress = Math.min(Math.round((raisedAmount / goalAmount) * 100), 100)

        return (
          <Card key={campaign.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{campaign.title}</CardTitle>
                  <CardDescription>Created on {new Date(campaign.createdAt).toLocaleDateString()}</CardDescription>
                </div>
                <Badge variant={campaign.status === "active" ? "default" : "secondary"}>{campaign.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{campaign.description}</p>
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
            <CardFooter className="flex justify-between">
              <Link href={`/campaigns/${campaign.id}`}>
                <Button variant="outline">View Campaign</Button>
              </Link>
              <div className="flex gap-2">
                <Link href={`/campaigns/${campaign.id}/edit`}>
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteCampaign(campaign.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}