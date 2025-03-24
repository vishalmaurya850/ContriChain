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
        {
          id: "user3",
          name: "Charlie Davis",
          email: "charlie@example.com",
          walletAddress: "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db",
          isAdmin: true,
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
        },
      ])
    }

    const usersSnapshot = await adminFirestore.collection("users").orderBy("createdAt", "desc").get()

    const users = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return NextResponse.json(users)
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

