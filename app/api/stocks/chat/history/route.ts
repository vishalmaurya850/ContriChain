import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { findMany } from "@/lib/mongodb-admin"
import type { ChatSession } from "@/lib/models/types"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get URL parameters
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Get chat history for the current user
    const chatSessions = (await findMany(
      "chatSessions",
      { userId: session.user.id, category: "stocks" },
      { sort: { updatedAt: -1 }, limit },
    )) as (ChatSession & { _id: { toString(): string } })[]

    // Format the response
    const formattedSessions = chatSessions.map((session: ChatSession & { _id: { toString(): string } }) => ({
      id: session._id.toString(),
      title: session.title,
      preview: session.messages[session.messages.length - 1]?.content.substring(0, 60) + "...",
      timestamp: session.updatedAt,
    }))

    return NextResponse.json(formattedSessions)
  } catch (error) {
    console.error("Error fetching chat history:", error)
    return NextResponse.json({ error: "Failed to fetch chat history" }, { status: 500 })
  }
}