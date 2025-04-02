import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { getCollection } from "@/lib/mongodb-admin"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const usersCollection = await getCollection("users")
    const users = await usersCollection.find().sort({ createdAt: -1 }).toArray()

    return NextResponse.json(
      users.map((user) => ({
        id: user._id.toString(),
        ...user,
        _id: undefined,
        password: undefined, // Don't send password to client
      })),
    )
  } catch (error) {
    console.error("Error fetching users:", error)
    // Return mock data in case of error
  }
}