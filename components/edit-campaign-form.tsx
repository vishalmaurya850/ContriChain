"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { updateCampaign } from "@/lib/campaign-service"

const editCampaignSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(2000, "Description must be less than 2000 characters"),
  imageUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  status: z.enum(["active", "paused", "completed"]).optional(),
})

type EditFormValues = z.infer<typeof editCampaignSchema>

interface EditCampaignFormProps {
  campaign: {
    id: string
    title: string
    description: string
    imageUrl?: string
    status: "active" | "paused" | "completed"
  }
}

export function EditCampaignForm({ campaign }: EditCampaignFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EditFormValues>({
    resolver: zodResolver(editCampaignSchema),
    defaultValues: {
      title: campaign.title,
      description: campaign.description,
      imageUrl: campaign.imageUrl || "",
      status: campaign.status,
    },
  })

  const onSubmit = async (data: EditFormValues) => {
    setIsSubmitting(true)

    try {
      await updateCampaign(campaign.id, {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl || undefined,
        status: data.status,
      })

      toast({
        title: "Campaign updated",
        description: "Your campaign has been updated successfully",
      })

      router.push(`/campaigns/${campaign.id}`)
      router.refresh()
    } catch (error) {
      console.error("Error updating campaign:", error)
      toast({
        title: "Failed to update campaign",
        description: "There was an error updating your campaign. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Campaign Title</Label>
          <Input id="title" {...register("title")} disabled={isSubmitting} />
          {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" {...register("description")} rows={5} disabled={isSubmitting} />
          {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="imageUrl">Campaign Image URL (Optional)</Label>
          <Input
            id="imageUrl"
            {...register("imageUrl")}
            disabled={isSubmitting}
            placeholder="https://example.com/image.jpg"
          />
          {errors.imageUrl && <p className="text-sm text-destructive">{errors.imageUrl.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Campaign Status</Label>
          <Select
            defaultValue={campaign.status}
            onValueChange={(value) => setValue("status", value as "active" | "paused" | "completed")}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
        </div>

        <div className="flex gap-4">
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Campaign"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}

