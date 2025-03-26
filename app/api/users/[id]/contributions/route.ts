import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { findMany } from "@/lib/mongodb-admin"

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)

  // Allow users to view their own contributions or admins to view any user's contributions
  if (!session || !session.user || (session.user.id !== (await context.params).id && !session.user.isAdmin)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const contributions = await findMany("contributions", { userId: (await context.params).id })

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

