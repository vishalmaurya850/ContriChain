import { findMany, findOne, createObjectId } from "@/lib/mongodb-admin"

export interface Campaign {
  id: string;
  title: string;
  description: string;
  userId: string;
  status: string;
  // Add other fields as necessary
}

export async function getAllCampaigns(options?: {
  category?: string
  status?: string
  limit?: number
}) {
  try {
    const query: Record<string, unknown> = {}

    if (options?.category) {
      query.category = options.category
    }

    if (options?.status) {
      query.status = options.status
    }

    let campaigns = await findMany("campaigns", query)

    // Sort by createdAt in descending order
    campaigns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    if (options?.limit) {
      campaigns = campaigns.slice(0, options.limit)
    }

    return campaigns.map((campaign) => ({
      id: campaign._id.toString(),
      ...campaign,
      _id: undefined,
    }))
  } catch (error) {
    console.error("Error getting campaigns:", error)
    throw error
  }
}

export async function getCampaignById(id: string): Promise<{ id: string; userId: string; title: string; description?: string; status?: string } | null> {
  try {
    const campaign = await findOne("campaigns", { _id: createObjectId(id) })

    if (!campaign) {
      return null
    }

    const { _id, ...rest } = campaign;
    return {
      id: _id.toString(),
      userId: rest.userId,
      title: rest.title,
    }
  } catch (error) {
    console.error("Error getting campaign:", error)
    throw error
  }
}

export async function getUserCampaigns(userId: string) {
  try {
    const campaigns = await findMany("campaigns", { userId })

    return campaigns.map((campaign) => ({
      id: campaign._id.toString(),
      ...campaign,
      _id: undefined,
    }))
  } catch (error) {
    console.error("Error getting user campaigns:", error)
    throw error
  }
}