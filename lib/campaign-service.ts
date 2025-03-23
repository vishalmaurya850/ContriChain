import clientPromise from "./mongodb"
import { ObjectId } from "mongodb"
import type { Campaign } from "./models/types"

export async function getAllCampaigns(options?: {
  category?: string
  status?: string
  limit?: number
}): Promise<Campaign[]> {
  try {
    const client = await clientPromise
    const db = client.db()

    const query: Record<string, string> = {}

    if (options?.category) {
      query.category = options.category
    }

    if (options?.status) {
      query.status = options.status
    }

    let cursor = db.collection("campaigns").find(query).sort({ createdAt: -1 })

    if (options?.limit) {
      cursor = cursor.limit(options.limit)
    }

    const campaigns = await cursor.toArray()
    return campaigns as Campaign[]
  } catch (error) {
    console.error("Error getting campaigns:", error)
    throw error
  }
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
  try {
    const client = await clientPromise
    const db = client.db()

    const campaign = await db.collection("campaigns").findOne({ _id: new ObjectId(id) })

    if (!campaign) {
      return null
    }

    return campaign as Campaign
  } catch (error) {
    console.error("Error getting campaign:", error)
    throw error
  }
}

export async function createCampaign(data: {
  title: string
  description: string
  goal: number
  duration: number
  category: string
  userId: string
  userName: string
  userImage?: string
  imageUrl?: string
  onChainId: string
  transactionHash: string
}): Promise<Campaign> {
  try {
    const client = await clientPromise
    const db = client.db()

    // Calculate deadline
    const deadline = Math.floor(Date.now() / 1000) + data.duration * 24 * 60 * 60

    const campaign: Campaign = {
      title: data.title,
      description: data.description,
      goal: data.goal,
      raised: 0,
      deadline,
      userId: data.userId,
      userName: data.userName,
      userImage: data.userImage,
      imageUrl: data.imageUrl,
      status: "active",
      category: data.category,
      createdAt: new Date(),
      onChainId: data.onChainId,
      transactionHash: data.transactionHash,
    }

    const result = await db.collection("campaigns").insertOne(campaign)

    return {
      ...campaign,
      _id: result.insertedId,
    }
  } catch (error) {
    console.error("Error creating campaign:", error)
    throw error
  }
}

export async function updateCampaign(
  id: string,
  data: Partial<Omit<Campaign, "_id" | "userId" | "createdAt">>,
): Promise<Campaign | null> {
  try {
    const client = await clientPromise
    const db = client.db()

    const result = await db.collection("campaigns").findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...data,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    )

    if (!result) {
      throw new Error("Failed to update campaign: result is null")
    }
    return result.value as Campaign | null
  } catch (error) {
    console.error("Error updating campaign:", error)
    throw error
  }
}

export async function deleteCampaign(id: string): Promise<boolean> {
  try {
    const client = await clientPromise
    const db = client.db()

    const result = await db.collection("campaigns").deleteOne({ _id: new ObjectId(id) })

    return result.deletedCount === 1
  } catch (error) {
    console.error("Error deleting campaign:", error)
    throw error
  }
}

export async function getUserCampaigns(userId: string): Promise<Campaign[]> {
  try {
    const client = await clientPromise
    const db = client.db()

    const campaigns = await db.collection("campaigns").find({ userId }).sort({ createdAt: -1 }).toArray()

    return campaigns as Campaign[]
  } catch (error) {
    console.error("Error getting user campaigns:", error)
    throw error
  }
}