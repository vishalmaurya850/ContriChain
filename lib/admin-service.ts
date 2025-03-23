import clientPromise from "./mongodb"
import { ObjectId } from "mongodb"

export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const client = await clientPromise
    const db = client.db()

    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) })

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
    const client = await clientPromise
    const db = client.db()

    // Get total campaigns
    const totalCampaigns = await db.collection("campaigns").countDocuments()

    // Get active campaigns
    const activeCampaigns = await db.collection("campaigns").countDocuments({ status: "active" })

    // Get total users
    const totalUsers = await db.collection("users").countDocuments()

    // Get total funds raised
    const campaignsAggregate = await db
      .collection("campaigns")
      .aggregate<{ _id: null; totalRaised: number }>([
        {
          $group: {
            _id: null,
            totalRaised: { $sum: "$raised" },
          },
        },
      ])
      .toArray()

    const totalFundsRaised = campaignsAggregate.length > 0 ? campaignsAggregate[0].totalRaised : 0

    // Get transactions today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const transactionsToday = await db.collection("transactions").countDocuments({
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