import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { findMany } from "@/lib/mongodb-admin"

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)

  // Allow users to view their own campaigns or admins to view any user's campaigns
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Await the params to resolve the promise
    const { id } = await context.params

    if (!session.user || (session.user.id !== id && !session.user.isAdmin)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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