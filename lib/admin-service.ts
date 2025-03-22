import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(db, "users", userId))

    if (!userDoc.exists()) {
      return false
    }

    return userDoc.data().isAdmin === true
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

export async function getAdminStats() {
  // In a real implementation, this would fetch actual stats from the database
  // For now, return sample data
  return {
    totalCampaigns: 42,
    activeCampaigns: 28,
    totalUsers: 156,
    totalFundsRaised: 24.5, // ETH
    transactionsToday: 12,
  }
}

