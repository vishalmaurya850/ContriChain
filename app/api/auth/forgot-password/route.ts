import { NextResponse } from "next/server"
import { z } from "zod"
import { findOne } from "@/lib/mongodb-admin"
import { randomBytes } from "crypto"
import { updateOne } from "@/lib/mongodb-admin"
import { sendPasswordResetEmail } from "@/lib/email-service"

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

    // Get the base URL for the reset link
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http"
    const host = request.headers.get("host") || "localhost:3000"
    const baseUrl = `${protocol}://${host}`

    // Send the reset email
    await sendPasswordResetEmail(email, resetToken, baseUrl)

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }

    console.error("Password reset error:", error)
    return NextResponse.json({ error: "Failed to process password reset" }, { status: 500 })
  }
}