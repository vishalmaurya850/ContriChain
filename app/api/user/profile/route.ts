import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { z } from "zod"

// Schema for profile update
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  image: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
})

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, image } = profileSchema.parse(body)

    // For development with mock DB, return success
    if (process.env.NODE_ENV === "development" && (process.env.USE_MOCK_DB === "true" || !process.env.MONGODB_URI)) {
      return NextResponse.json({ success: true })
    }

    // Import dynamically to avoid issues with the mock DB
    const { updateOne, createObjectId } = await import("@/lib/mongodb-admin")

    // Update user in database
    await updateOne(
      "users",
      { _id: createObjectId(session.user.id) },
      {
        $set: {
          name,
          image: image || null,
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }

    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}