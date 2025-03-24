import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { z } from "zod"
import { adminFirestore } from "@/lib/firebase-admin"

// Schema for contribution
const contributionSchema = z.object({
  amount: z.number().positive(),
  transactionHash: z.string(),
})

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Await the params to resolve the promise
    const { id } = await context.params

    // Check if campaign exists
    const campaignDoc = await adminFirestore.collection("campaigns").doc(id).get()

    if (!campaignDoc.exists) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    const campaignData = campaignDoc.data()
    if (!campaignData) {
      return NextResponse.json({ error: "Campaign data is invalid" }, { status: 500 })
    }

    const body = await request.json()

    // Validate request body
    const validatedData = contributionSchema.parse(body)

    // Get user data
    if (!session.user) {
      return NextResponse.json({ error: "User session is invalid" }, { status: 400 })
    }
    const userId = session.user.id // Assuming id is used as the unique identifier
    if (!userId) {
      return NextResponse.json({ error: "User ID is invalid" }, { status: 400 })
    }
    const userDoc = await adminFirestore.collection("users").doc(userId).get()

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userData = userDoc.data()

    // Create contribution in Firestore
    const contributionData = {
      campaignId: id,
      campaignTitle: campaignData.title,
      userId: userId,
      userName: userData?.name ?? "Anonymous",
      userImage: userData?.image ?? "default-image-url",
      amount: validatedData.amount,
      transactionHash: validatedData.transactionHash,
      timestamp: new Date(),
    }

    const contributionRef = await adminFirestore.collection("contributions").add(contributionData)

    // Update campaign raised amount
    await adminFirestore
      .collection("campaigns")
      .doc(id)
      .update({
        raised: campaignData.raised + validatedData.amount,
      })

    // Create transaction record
    await adminFirestore.collection("transactions").add({
      type: "contribution",
      campaignId: id,
      campaignTitle: campaignData.title,
      userId: userId,
      userName: userData?.name ?? "Anonymous",
      amount: validatedData.amount,
      transactionHash: validatedData.transactionHash,
      timestamp: new Date(),
      status: "confirmed",
    })

    return NextResponse.json(
      {
        id: contributionRef.id,
        ...contributionData,
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }

    console.error("Error processing contribution:", error)
    return NextResponse.json({ error: "Failed to process contribution" }, { status: 500 })
  }
}