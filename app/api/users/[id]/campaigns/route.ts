import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { findMany } from "@/lib/mongodb-admin"

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)

  // Await the params to resolve the Promise
  const { id } = await context.params

  // Allow users to view their own campaigns or admins to view any user's campaigns
  if (!session || (session.user.id !== id && !session.user.isAdmin)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const campaigns = await findMany("campaigns", { userId: id })

    return NextResponse.json(
      campaigns.map((campaign) => ({
        id: campaign._id.toString(),
        ...campaign,
        _id: undefined,
      })),
    )
  } catch (error) {
    console.error("Error fetching user campaigns:", error)
    return NextResponse.json({ error: "Failed to fetch user campaigns" }, { status: 500 })
  }
}