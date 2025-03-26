import { findMany, findOne, createObjectId } from "@/lib/mongodb-admin"

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

export async function getCampaignById(id: string) {
  try {
    const campaign = await findOne("campaigns", { _id: createObjectId(id) })

    if (!campaign) {
      return null
    }

    return {
      id: campaign._id.toString(),
      ...campaign,
      _id: undefined,
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