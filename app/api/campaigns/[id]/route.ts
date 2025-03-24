import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { Session } from "next-auth"

// Extend the Session type to include user.id
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      isAdmin?: boolean
      walletAddress?: string | null
    }
  }
}
import { authOptions } from "@/lib/auth-options"
import { z } from "zod"
import { adminFirestore } from "@/lib/firebase-admin"

// Schema for campaign updates
const updateCampaignSchema = z.object({
  title: z.string().min(5).max(100).optional(),
  description: z.string().min(20).max(2000).optional(),
  imageUrl: z.string().url().optional(),
  status: z.enum(["active", "paused", "completed"]).optional(),
})

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params // Await the params to resolve the promise

    const campaignDoc = await adminFirestore.collection("campaigns").doc(id).get()

    if (!campaignDoc.exists) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: campaignDoc.id,
      ...campaignDoc.data(),
    })
  } catch (error) {
    console.error("Error fetching campaign:", error)
    return NextResponse.json({ error: "Failed to fetch campaign" }, { status: 500 })
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions) as Session & { user: { isAdmin?: boolean } }

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await context.params // Await the params to resolve the promise

    // Get campaign to check ownership
    const campaignDoc = await adminFirestore.collection("campaigns").doc(id).get()

    if (!campaignDoc.exists) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    const campaignData = campaignDoc.data()

    // Check if user is the owner or an admin
    const userIsAdmin = session.user?.isAdmin ?? false
    if (!campaignData || (campaignData.userId !== session.user.id && !userIsAdmin)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()

    // Validate request body
    const validatedData = updateCampaignSchema.parse(body)

    // Update campaign in Firestore
    await adminFirestore
      .collection("campaigns")
      .doc(id)
      .update({
        ...validatedData,
        updatedAt: new Date(),
      })

    // Get updated campaign
    const updatedCampaignDoc = await adminFirestore.collection("campaigns").doc(id).get()

    return NextResponse.json({
      id: updatedCampaignDoc.id,
      ...updatedCampaignDoc.data(),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }

    console.error("Error updating campaign:", error)
    return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await context.params // Await the params to resolve the promise

    // Get campaign to check ownership
    const campaignDoc = await adminFirestore.collection("campaigns").doc(id).get()

    if (!campaignDoc.exists) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    const campaignData = campaignDoc.data()

    // Check if user is the owner or an admin
    const userIsAdmin = session.user.isAdmin
    if (!campaignData || (campaignData.userId !== session.user.id && !userIsAdmin)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Delete campaign from Firestore
    await adminFirestore.collection("campaigns").doc(id).delete()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting campaign:", error)
    return NextResponse.json({ error: "Failed to delete campaign" }, { status: 500 })
  }
}