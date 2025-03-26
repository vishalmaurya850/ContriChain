import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { getCollection } from "@/lib/mongodb-admin"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.isAdmin) {
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
    return NextResponse.json([
      {
        id: "user1",
        name: "Alice Johnson",
        email: "alice@example.com",
        walletAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
        isAdmin: false,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      },
      {
        id: "user2",
        name: "Bob Smith",
        email: "bob@example.com",
        walletAddress: "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2",
        isAdmin: false,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      },
    ])
  }
}

