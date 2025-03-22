import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { createCampaign, getAllCampaigns } from "@/lib/campaign-service"
import { z } from "zod"

// Schema for campaign creation
const campaignSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(2000),
  goal: z.number().positive(),
  duration: z.number().int().positive(),
  category: z.string(),
  imageUrl: z.string().url().optional(),
})

export async function GET() {
  try {
    const campaigns = await getAllCampaigns()
    return NextResponse.json(campaigns)
  } catch (error) {
    console.error("Error fetching campaigns:", error)
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Validate request body
    const validatedData = campaignSchema.parse(body)

    // Create campaign
    const campaign = await createCampaign({
      ...validatedData,
      userId: session.user.id,
      onChainId: "generatedOnChainId", // Replace with actual logic to generate or fetch onChainId
      transactionHash: "generatedTransactionHash", // Replace with actual logic to generate or fetch transactionHash
    })

    return NextResponse.json(campaign, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }

    console.error("Error creating campaign:", error)
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 })
  }
}

