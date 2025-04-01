import { findOne, countDocuments, aggregate, createObjectId } from "@/lib/mongodb-admin"

export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const user = await findOne("users", { _id: createObjectId(userId) })

    if (!user) {
      return false
    }

    return user.isAdmin === true
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

export async function getAdminStats(): Promise<{
  totalCampaigns: number
  activeCampaigns: number
  totalUsers: number
  totalFundsRaised: number
  transactionsToday: number
}> {
  try {
    // Get total campaigns
    const totalCampaigns = await countDocuments("campaigns")

    // Get active campaigns
    const activeCampaigns = await countDocuments("campaigns", { status: "active" })

    // Get total users
    const totalUsers = await countDocuments("users")

    // Get total funds raised
    interface CampaignAggregateResult {
      _id: null
      totalRaised: number
    }

    const campaignsAggregate = await aggregate("campaigns", [
      {
        $group: {
          _id: null,
          totalRaised: { $sum: "$raised" },
        },
      },
    ]) as unknown as CampaignAggregateResult[]

    const totalFundsRaised = campaignsAggregate.length > 0 ? campaignsAggregate[0].totalRaised : 0

    // Get transactions today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const transactionsToday = await countDocuments("transactions", {
      timestamp: { $gte: today },
    })

    return {
      totalCampaigns,
      activeCampaigns,
      totalUsers,
      totalFundsRaised,
      transactionsToday,
    }
  } catch (error) {
    console.error("Error getting admin stats:", error)
    throw error
  }
}