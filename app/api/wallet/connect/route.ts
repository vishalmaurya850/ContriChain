import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { updateOne, createObjectId } from "@/lib/mongodb-admin"
import { z } from "zod"
import { ethers } from "ethers"

// Schema for wallet connection
const walletSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  signature: z.string(),
  message: z.string(),
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Validate request body
    const validatedData = walletSchema.parse(body)

    // Verify signature
    const recoveredAddress = ethers.verifyMessage(validatedData.message, validatedData.signature)

    if (recoveredAddress.toLowerCase() !== validatedData.address.toLowerCase()) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    // Update user's wallet address
    await updateOne(
      "users",
      { _id: createObjectId(session.user.id) },
      {
        $set: {
          walletAddress: validatedData.address,
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }

    console.error("Error connecting wallet:", error)
    return NextResponse.json({ error: "Failed to connect wallet" }, { status: 500 })
  }
}