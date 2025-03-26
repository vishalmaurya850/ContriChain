import { NextResponse } from "next/server"
import { z } from "zod"
import { findOne, updateOne } from "@/lib/mongodb-admin"
import { hash } from "bcryptjs"

// Schema for password reset
const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token, password } = resetPasswordSchema.parse(body)

    // Find user with this reset token
    const user = await findOne("users", {
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }, // Token must not be expired
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 })
    }

    // Hash the new password
    const hashedPassword = await hash(password, 12)

    // Update the user's password and remove the reset token
    await updateOne(
      "users",
      { resetToken: token },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
        $unset: {
          resetToken: "",
          resetTokenExpiry: "",
        },
      },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }

    console.error("Password reset error:", error)
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 })
  }
}