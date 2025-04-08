"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Web3Provider } from "@ethersproject/providers"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createCampaignOnChain } from "@/lib/contract-utils"

const campaignSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(2000, "Description must be less than 2000 characters"),
  goal: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Goal must be a positive number"),
  duration: z
    .string()
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0 && Number(val) <= 90,
      "Duration must be between 1 and 90 days",
    ),
  category: z.string().min(1, "Please select a category"),
  imageUrl: z.string().url("Please enter a valid URL").optional(),
})

type FormValues = z.infer<typeof campaignSchema>

export function CreateCampaignForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      title: "",
      description: "",
      goal: "1",
      duration: "30",
      category: "",
      imageUrl: "",
    },
  })

  const onSubmit = async (data: FormValues) => {
    if (!session?.user?.id) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a campaign",
        variant: "destructive",
      })
      router.push("/login?callbackUrl=/create")
      return
    }

    if (!window.ethereum) {
      toast({
        title: "MetaMask not detected",
        description: "Please install MetaMask to create a campaign",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Connect to provider
      const provider = new Web3Provider(window.ethereum)

      // Request account access
      await window.ethereum.request({ method: "eth_requestAccounts" })

      // Create campaign on blockchain with timeout and better error handling
      const createOnChainPromise = createCampaignOnChain(
        provider,
        data.title,
        data.description,
        Number(data.goal),
        Number(data.duration),
        data.imageUrl || "/placeholder.svg?height=400&width=600",
      )

      // Add timeout to the blockchain operation
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Transaction timeout - check your MetaMask for pending transactions")),
          60000,
        ),
      )

      const result = (await Promise.race([createOnChainPromise, timeoutPromise])) as {
        campaignId: string
        transactionHash: string
      }

      // Show intermediate success message
      toast({
        title: "Transaction submitted",
        description: "Your blockchain transaction is being processed. Please wait...",
      })

      // Create campaign in database
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          goal: Number(data.goal),
          duration: Number(data.duration),
          category: data.category,
          imageUrl: data.imageUrl || "/placeholder.svg?height=400&width=600",
          onChainId: result.campaignId,
          transactionHash: result.transactionHash,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to create campaign in database")
      }

      const campaign = await response.json()

      toast({
        title: "Campaign created",
        description: "Your campaign has been created successfully",
      })

      router.push(`/campaigns/${campaign.id}`)
    } catch (error) {
      console.error("Error creating campaign:", error)

      // More specific error messages
      if (error instanceof Error && error.message?.includes("User denied transaction")) {
        toast({
          title: "Transaction cancelled",
          description: "You cancelled the transaction in MetaMask.",
          variant: "destructive",
        })
      } else if (error instanceof Error && error.message?.includes("timeout")) {
        toast({
          title: "Transaction timeout",
          description:
            "The transaction is taking longer than expected. Please check MetaMask for pending transactions.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Failed to create campaign",
          description:
            error instanceof Error ? error.message : "There was an error creating your campaign. Please try again.",
          variant: "destructive",
        })
      }
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
          <Textarea
            id="description"
            {...register("description")}
            rows={5}
            disabled={isSubmitting}
            placeholder="Describe your campaign and what you're raising funds for"
          />
          {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="goal">Funding Goal (ETH)</Label>
            <Input id="goal" type="number" step="0.01" min="0.01" {...register("goal")} disabled={isSubmitting} />
            {errors.goal && <p className="text-sm text-destructive">{errors.goal.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Campaign Duration (Days)</Label>
            <Input id="duration" type="number" min="1" max="90" {...register("duration")} disabled={isSubmitting} />
            {errors.duration && <p className="text-sm text-destructive">{errors.duration.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select onValueChange={(value) => setValue("category", value)} disabled={isSubmitting}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="environment">Environment</SelectItem>
              <SelectItem value="health">Health</SelectItem>
              <SelectItem value="community">Community</SelectItem>
              <SelectItem value="art">Art & Culture</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
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

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating Campaign..." : "Create Campaign"}
        </Button>
      </form>
    </Card>
  )
}