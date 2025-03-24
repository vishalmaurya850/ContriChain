import { NextResponse } from "next/server"
import { adminFirestore } from "@/lib/firebase-admin"

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    // Await the params to resolve the promise
    const { id } = await context.params

    // Check if campaign exists
    const campaignDoc = await adminFirestore.collection("campaigns").doc(id).get()

    if (!campaignDoc.exists) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    // Get contributions for this campaign
    const contributionsSnapshot = await adminFirestore
      .collection("contributions")
      .where("campaignId", "==", id)
      .orderBy("timestamp", "desc")
      .get()

    const contributions = contributionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return NextResponse.json(contributions)
  } catch (error) {
    console.error("Error fetching contributions:", error)
    return NextResponse.json({ error: "Failed to fetch contributions" }, { status: 500 })
  }
}