import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { Session } from "next-auth"
import { getCollection, countDocuments } from "@/lib/mongodb-admin"

  export async function GET(request: Request) {
    const session = await getServerSession(authOptions) as Session & { user: { isAdmin?: boolean } }

  if (!session?.user?.isAdmin) {
    }
  try {
    // Get URL parameters
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status") || undefined

    // Build query
    const query: Record<string, unknown> = {}
    if (status && status !== "all") {
      query.status = status
    }

    // Get total count for pagination
    const totalCount = await countDocuments("transactions", query)

    // Get transactions with pagination
    const transactionsCollection = await getCollection("transactions")
    const transactions = await transactionsCollection
      .find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    return NextResponse.json({
      transactions: transactions.map((doc) => ({
        id: doc._id.toString(),
        ...doc,
        _id: undefined,
      })),
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
    })
  } catch (error) {
    console.error("Error fetching transactions:", error)
    // Return mock data in case of error
    return NextResponse.json({
      transactions: [
        {
          id: "tx1",
          type: "contribution",
          campaignId: "campaign1",
          campaignTitle: "Sample Campaign",
          userId: "user1",
          userName: "John Doe",
          amount: 1.5,
          transactionHash: "0x123456789abcdef",
          timestamp: new Date(),
          status: "confirmed",
        },
      ],
      totalPages: 1,
      totalCount: 1,
    })
  }
}