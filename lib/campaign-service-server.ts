import { adminFirestore } from "@/lib/firebase-admin"

export async function getAllCampaigns(options?: {
  category?: string
  status?: string
  limit?: number
}) {
  try {
    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = adminFirestore.collection("campaigns")

    if (options?.category) {
      query = query.where("category", "==", options.category)
    }

    if (options?.status) {
      query = query.where("status", "==", options.status)
    }

    query = query.orderBy("createdAt", "desc")

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const campaignsSnapshot = await query.get()

    return campaignsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error getting campaigns:", error)
    throw error
  }
}

export async function getCampaignById(id: string) {
  try {
    const campaignDoc = await adminFirestore.collection("campaigns").doc(id).get()

    if (!campaignDoc.exists) {
      return null
    }

    return {
      id: campaignDoc.id,
      ...campaignDoc.data(),
    }
  } catch (error) {
    console.error("Error getting campaign:", error)
    throw error
  }
}

export async function getUserCampaigns(userId: string) {
  try {
    const campaignsSnapshot = await adminFirestore
      .collection("campaigns")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get()

    return campaignsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error getting user campaigns:", error)
    throw error
  }
}