"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import type { CampaignUpdate } from "@/lib/models/types"

interface CampaignUpdatesProps {
  campaignId: string
}

export function CampaignUpdates({ campaignId }: CampaignUpdatesProps) {
  const [updates, setUpdates] = useState<CampaignUpdate[]>([])
  const [loading, setLoading] = useState(true)
  const [newUpdate, setNewUpdate] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: session } = useSession()
  const { toast } = useToast()

  // Check if user is campaign owner
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const response = await fetch(`/api/campaigns/${campaignId}/updates`)

        if (!response.ok) {
          throw new Error("Failed to fetch updates")
        }

        const data = await response.json()
        setUpdates(data.updates)
        setIsOwner(data.isOwner)
      } catch (error) {
        console.error("Error fetching updates:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUpdates()
  }, [campaignId, session])

  const handleSubmitUpdate = async () => {
    if (!newUpdate.trim()) {
      toast({
        title: "Empty update",
        description: "Please enter an update message",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/updates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newUpdate,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to post update")
      }

      const data = await response.json()

      // Add new update to the list
      setUpdates([data, ...updates])
      setNewUpdate("")

      toast({
        title: "Update posted",
        description: "Your update has been posted successfully",
      })
    } catch (error) {
      console.error("Error posting update:", error)
      toast({
        title: "Failed to post update",
        description: "There was an error posting your update. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {isOwner && (
        <Card>
          <CardHeader>
            <CardTitle>Post an Update</CardTitle>
            <CardDescription>Keep your supporters informed about your progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder="Share news, milestones, or changes to your campaign..."
                value={newUpdate}
                onChange={(e) => setNewUpdate(e.target.value)}
                rows={4}
                disabled={isSubmitting}
              />
              <Button onClick={handleSubmitUpdate} disabled={isSubmitting}>
                {isSubmitting ? "Posting..." : "Post Update"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {updates.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No updates yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {updates.map((update) => (
            <Card key={update._id?.toString()}>
              <CardHeader>
                <CardTitle className="text-lg">{update.title || "Campaign Update"}</CardTitle>
                <CardDescription>
                  {new Date(update.timestamp).toLocaleDateString()} at {new Date(update.timestamp).toLocaleTimeString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>{update.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}