import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { findMany } from "@/lib/mongodb-admin"

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)

  // Await the params to resolve the Promise
  const { id } = await context.params

  // Allow users to view their own contributions or admins to view any user's contributions
  if (!session || (session.user.id !== id && !session.user.isAdmin)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const contributions = await findMany("contributions", { userId: id })

    return NextResponse.json(
      contributions.map((contribution) => ({
        id: contribution._id.toString(),
        ...contribution,
        _id: undefined,
      })),
    )
  } catch (error) {
    console.error("Error fetching user contributions:", error)
    return NextResponse.json({ error: "Failed to fetch user contributions" }, { status: 500 })
  }
}