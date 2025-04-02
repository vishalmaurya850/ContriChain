import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { z } from "zod"
import { getCollection, findOne, insertOne } from "@/lib/mongodb-admin"
import { ObjectId } from "mongodb"

// Schema for campaign creation
const campaignSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(2000),
  goal: z.number().positive(),
  duration: z.number().int().positive(),
  category: z.string(),
  imageUrl: z.string().url().optional(),
  onChainId: z.string(),
  transactionHash: z.string(),
})

export async function GET() {
  try {
    // Get campaigns from MongoDB
    const campaignsCollection = await getCollection("campaigns")
    const campaigns = await campaignsCollection.find().sort({ createdAt: -1 }).toArray()

    return NextResponse.json(
      campaigns.map((campaign) => ({
        id: campaign._id.toString(),
        ...campaign,
        _id: undefined,
      })),
    )
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

    // Get user data from MongoDB
    const user = await findOne("users", { _id: new ObjectId(session.user.id) })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Calculate deadline
    const deadline = Math.floor(Date.now() / 1000) + validatedData.duration * 24 * 60 * 60

    // Create campaign in MongoDB
    const campaignData = {
      ...validatedData,
      userId: session.user.id,
      userName: user.name || session.user.name,
      userImage: user.image || session.user.image,
      status: "active",
      raised: 0,
      deadline,
      createdAt: new Date(),
    }

    const result = await insertOne("campaigns", campaignData)

    return NextResponse.json(
      {
        id: result.insertedId.toString(),
        ...campaignData,
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }

    console.error("Error creating campaign:", error)
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 })
  }
}