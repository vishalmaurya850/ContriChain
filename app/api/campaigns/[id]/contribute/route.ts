import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { getCampaignById } from "@/lib/campaign-service"
import { createContribution } from "@/lib/contribution-service"
import { getUserById } from "@/lib/user-service"
import { z } from "zod"
import { ethers, JsonRpcProvider } from "ethers"
import { getCrowdfundingContract } from "@/lib/contract-utils"
import { contractAddress } from "@/lib/contract-address"

// Schema for contribution
const contributionSchema = z.object({
  amount: z.number().positive(),
  transactionHash: z.string(),
})

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const campaign = await getCampaignById(params.id)

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    const body = await request.json()

    // Validate request body
    const validatedData = contributionSchema.parse(body)

    // Verify transaction on blockchain
    const isValidTransaction = await verifyTransaction(
      validatedData.transactionHash,
      campaign.onChainId,
      validatedData.amount,
    )

    if (!isValidTransaction) {
      return NextResponse.json({ error: "Invalid transaction" }, { status: 400 })
    }

    // Get user data
    const user = await getUserById(session.user.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create contribution record
    const contribution = await createContribution({
      campaignId: params.id,
      campaignTitle: campaign.title,
      userId: session.user.id,
      userName: user.name,
      userImage: user.image,
      amount: validatedData.amount,
      transactionHash: validatedData.transactionHash,
    })

    return NextResponse.json(contribution, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }

    console.error("Error processing contribution:", error)
    return NextResponse.json({ error: "Failed to process contribution" }, { status: 500 })
  }
}

async function verifyTransaction(transactionHash: string, campaignId: string, amount: number): Promise<boolean> {
  try {
    // Get provider
    const provider = new JsonRpcProvider(process.env.ETHEREUM_RPC_URL)

    // Get transaction
    const transaction = await provider.getTransaction(transactionHash)

    if (!transaction) {
      return false
    }

    // Wait for transaction to be mined
    const receipt = await transaction.wait()

    if (!receipt || receipt.status !== 1) {
      return false
    }

    // Get contract
    const contract = getCrowdfundingContract(provider)

    // Parse logs to verify contribution
    const contributionEvent = receipt.logs
      .filter((log) => log.address?.toLowerCase() === contractAddress?.toLowerCase())
      .map((log) => {
        try {
          return contract.interface.parseLog(log)
        } catch {
          return null
        }
      })
      .find((event) => event?.name === "ContributionMade" && event.args.campaignId.toString() === campaignId)

    if (!contributionEvent) {
      return false
    }

    // Verify amount
    const contributionAmount = ethers.formatEther(contributionEvent.args.amount)

    return Number.parseFloat(contributionAmount) === amount
  } catch (error) {
    console.error("Error verifying transaction:", error)
    return false
  }
}

