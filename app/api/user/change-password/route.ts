import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { z } from "zod"
import { compare, hash } from "bcryptjs"

// Schema for password change
const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Current password must be at least 6 characters"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { currentPassword, newPassword } = passwordSchema.parse(body)

    // For development with mock DB, return success
    if (process.env.NODE_ENV === "development" && (process.env.USE_MOCK_DB === "true" || !process.env.MONGODB_URI)) {
      return NextResponse.json({ success: true })
    }

    // Import dynamically to avoid issues with the mock DB
    const { findOne, updateOne, createObjectId } = await import("@/lib/mongodb-admin")

    // Get user from database
    const user = await findOne("users", { _id: createObjectId(session.user.id) })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify current password
    const isPasswordValid = await compare(currentPassword, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 12)

    // Update password in database
    await updateOne(
      "users",
      { _id: createObjectId(session.user.id) },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }

    console.error("Error changing password:", error)
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 })
  }
}