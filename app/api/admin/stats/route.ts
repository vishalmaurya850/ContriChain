import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { adminFirestore } from "@/lib/firebase-admin"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // For development, return mock data if Firebase Admin is not properly initialized
    if (!process.env.FIREBASE_ADMIN_CREDENTIALS) {
      return NextResponse.json({
        totalCampaigns: 5,
        activeCampaigns: 3,
        totalUsers: 10,
        totalFundsRaised: 25.5,
        transactionsToday: 2,
      })
    }

    // Get total campaigns
    const campaignsSnapshot = await adminFirestore.collection("campaigns").get()
    const totalCampaigns = campaignsSnapshot.size

    // Get active campaigns
    const activeCampaignsSnapshot = await adminFirestore.collection("campaigns").where("status", "==", "active").get()
    const activeCampaigns = activeCampaignsSnapshot.size

    // Get total users
    const usersSnapshot = await adminFirestore.collection("users").get()
    const totalUsers = usersSnapshot.size

    // Get total funds raised
    let totalFundsRaised = 0
    campaignsSnapshot.forEach((doc) => {
      const campaign = doc.data()
      totalFundsRaised += campaign.raised || 0
    })

    // Get transactions today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const transactionsTodaySnapshot = await adminFirestore
      .collection("transactions")
      .where("timestamp", ">=", today)
      .get()
    const transactionsToday = transactionsTodaySnapshot.size

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