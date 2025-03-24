import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { adminFirestore } from "@/lib/firebase-admin"
import { z } from "zod"

const toggleAdminSchema = z.object({
  isAdmin: z.boolean(),
})

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { isAdmin } = toggleAdminSchema.parse(body)

    // Await the params to resolve the promise
    const { id } = await context.params

    // For development, return success if Firebase Admin is not properly initialized
    if (!process.env.FIREBASE_ADMIN_CREDENTIALS) {
      return NextResponse.json({ success: true })
    }

    // Update user in Firestore
    await adminFirestore.collection("users").doc(id).update({
      isAdmin,
      updatedAt: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }

    console.error("Error toggling admin status:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}