import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { getCampaignById, updateCampaign, deleteCampaign } from "@/lib/campaign-service"

// Extend the Session type to include id and isAdmin
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      isAdmin: boolean
      walletAddress: string | null
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}
import { z } from "zod"

// Schema for campaign updates
const updateCampaignSchema = z.object({
  title: z.string().min(5).max(100).optional(),
  description: z.string().min(20).max(2000).optional(),
  imageUrl: z.string().url().optional(),
  status: z.enum(["active", "paused", "completed"]).optional(),
})

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const campaign = await getCampaignById(params.id)

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    return NextResponse.json(campaign)
  } catch (error) {
    console.error("Error fetching campaign:", error)
    return NextResponse.json({ error: "Failed to fetch campaign" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get campaign to check ownership
    const campaign = await getCampaignById(params.id)

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    // Check if user is the owner or an admin
    if (campaign.userId !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()

    // Validate request body
    const validatedData = updateCampaignSchema.parse(body)

    // Update campaign
    const updatedCampaign = await updateCampaign(params.id, validatedData)

    return NextResponse.json(updatedCampaign)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }

    console.error("Error updating campaign:", error)
    return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get campaign to check ownership
    const campaign = await getCampaignById(params.id)

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    // Check if user is the owner or an admin
    if (campaign.userId !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Delete campaign
    await deleteCampaign(params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting campaign:", error)
    return NextResponse.json({ error: "Failed to delete campaign" }, { status: 500 })
  }
}

