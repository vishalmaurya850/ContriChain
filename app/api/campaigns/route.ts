import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { z } from "zod"
import { adminFirestore } from "@/lib/firebase-admin"

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
    // Get campaigns from Firestore
    const campaignsSnapshot = await adminFirestore.collection("campaigns").orderBy("createdAt", "desc").get()

    const campaigns = campaignsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

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

    // Get user data from Firestore
    const userDoc = await adminFirestore.collection("users").doc(session.user.id).get()

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userData = userDoc.data()

    // Calculate deadline
    const deadline = Math.floor(Date.now() / 1000) + validatedData.duration * 24 * 60 * 60

    // Create campaign in Firestore
    const campaignData = {
      ...validatedData,
      userId: session.user.id,
      userName: userData?.name || "Anonymous",
      userImage: "image" in session.user ? session.user.image : "default-image-url",
      status: "active",
      raised: 0,
      deadline,
      createdAt: new Date(),
    }

    const campaignRef = await adminFirestore.collection("campaigns").add(campaignData)

    return NextResponse.json(
      {
        id: campaignRef.id,
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

