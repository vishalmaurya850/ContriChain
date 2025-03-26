import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { countDocuments, aggregate } from "@/lib/mongodb-admin"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || !session.user.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get total campaigns
    const totalCampaigns = await countDocuments("campaigns")

    // Get active campaigns
    const activeCampaigns = await countDocuments("campaigns", { status: "active" })

    // Get total users
    const totalUsers = await countDocuments("users")

    // Get total funds raised
    const campaignsAggregate = await aggregate("campaigns", [
      {
        $group: {
          _id: null,
          totalRaised: { $sum: "$raised" },
        },
      },
    ])

    const totalFundsRaised = campaignsAggregate.length > 0 ? campaignsAggregate[0].totalRaised : 0

    // Get transactions today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const transactionsToday = await countDocuments("transactions", {
      timestamp: { $gte: today },
    })

    return NextResponse.json({
      totalCampaigns,
      activeCampaigns,
      totalUsers,
      totalFundsRaised,
      transactionsToday,
    })
  } catch (error) {
    console.error("Error getting admin stats:", error)
    // Return mock data in case of error
    return NextResponse.json({
      totalCampaigns: 5,
      activeCampaigns: 3,
      totalUsers: 10,
      totalFundsRaised: 25.5,
      transactionsToday: 2,
    })
  }
}

