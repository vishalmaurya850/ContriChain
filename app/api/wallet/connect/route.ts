import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { updateUserWallet } from "@/lib/user-service"
import { z } from "zod"
import { verifyMessage } from "ethers"

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
    const recoveredAddress = verifyMessage(validatedData.message, validatedData.signature)

    if (recoveredAddress.toLowerCase() !== validatedData.address.toLowerCase()) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    // Update user's wallet address
    await updateUserWallet(session.user.id, validatedData.address)

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }

    console.error("Error connecting wallet:", error)
    return NextResponse.json({ error: "Failed to connect wallet" }, { status: 500 })
  }
}

