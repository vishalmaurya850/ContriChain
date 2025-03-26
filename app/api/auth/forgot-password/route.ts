import { NextResponse } from "next/server"
import { z } from "zod"
import { findOne } from "@/lib/mongodb-admin"
import { randomBytes } from "crypto"
import { updateOne } from "@/lib/mongodb-admin"

// Schema for password reset request
const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = forgotPasswordSchema.parse(body)

    // Check if user exists
    const user = await findOne("users", { email: email.toLowerCase() })

    if (!user) {
      // Don't reveal if the user exists or not for security reasons
      return NextResponse.json({ success: true })
    }

    // Generate a reset token
    const resetToken = randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

    // Store the reset token in the database
    await updateOne(
      "users",
      { email: email.toLowerCase() },
      {
        $set: {
          resetToken,
          resetTokenExpiry,
        },
      },
    )

    // In a real application, you would send an email with the reset link
    // For this example, we'll just return success
    // The reset link would be something like: /reset-password?token=${resetToken}

    console.log(`Reset token for ${email}: ${resetToken}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }

    console.error("Password reset error:", error)
    return NextResponse.json({ error: "Failed to process password reset" }, { status: 500 })
  }
}