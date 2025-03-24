import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { adminFirestore } from "@/lib/firebase-admin"

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)

  // Allow users to view their own contributions or admins to view any user's contributions
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await context.params // Await the params to resolve the promise

    if (session.user.id !== id && !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const contributionsSnapshot = await adminFirestore
      .collection("contributions")
      .where("userId", "==", id)
      .orderBy("timestamp", "desc")
      .get()

    const contributions = contributionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return NextResponse.json(contributions)
  } catch (error) {
    console.error("Error fetching user contributions:", error)
    return NextResponse.json({ error: "Failed to fetch user contributions" }, { status: 500 })
  }
}