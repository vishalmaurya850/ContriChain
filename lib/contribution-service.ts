import clientPromise from "./mongodb"
import { ObjectId } from "mongodb"
import type { Contribution } from "./models/types"

export async function createContribution(data: {
  campaignId: string
  campaignTitle: string
  userId: string
  userName: string
  userImage?: string
  amount: number
  transactionHash: string
}): Promise<Contribution> {
  try {
    const client = await clientPromise
    const db = client.db()

    // Start a session for transaction
    const session = client.startSession()

    let result: { insertedId: ObjectId } = { insertedId: new ObjectId() }

    try {
      await session.withTransaction(async () => {
        // Update campaign raised amount
        await db
          .collection("campaigns")
          .updateOne({ _id: new ObjectId(data.campaignId) }, { $inc: { raised: data.amount } }, { session })

        // Create contribution
        const contribution: Contribution = {
          campaignId: data.campaignId,
          campaignTitle: data.campaignTitle,
          userId: data.userId,
          userName: data.userName,
          userImage: data.userImage,
          amount: data.amount,
          transactionHash: data.transactionHash,
          timestamp: new Date(),
        }

        result = await db.collection("contributions").insertOne(contribution, { session })
        contribution._id = result.insertedId

        // Create transaction record
        await db.collection("transactions").insertOne(
          {
            type: "contribution",
            campaignId: data.campaignId,
            campaignTitle: data.campaignTitle,
            userId: data.userId,
            userName: data.userName,
            amount: data.amount,
            transactionHash: data.transactionHash,
            timestamp: new Date(),
            status: "confirmed",
          },
          { session },
        )
      })
    } finally {
      await session.endSession()
    }

    return {
      _id: result?.insertedId,
      campaignId: data.campaignId,
      campaignTitle: data.campaignTitle,
      userId: data.userId,
      userName: data.userName,
      userImage: data.userImage,
      amount: data.amount,
      transactionHash: data.transactionHash,
      timestamp: new Date(),
    }
  } catch (error) {
    console.error("Error creating contribution:", error)
    throw error
  }
}

export async function getCampaignContributions(campaignId: string): Promise<Contribution[]> {
  try {
    const client = await clientPromise
    const db = client.db()

    const contributions = await db.collection("contributions").find({ campaignId }).sort({ timestamp: -1 }).toArray()

    return contributions as Contribution[]
  } catch (error) {
    console.error("Error getting campaign contributions:", error)
    throw error
  }
}

export async function getUserContributions(userId: string): Promise<Contribution[]> {
  try {
    const client = await clientPromise
    const db = client.db()

    const contributions = await db.collection("contributions").find({ userId }).sort({ timestamp: -1 }).toArray()

    return contributions as Contribution[]
  } catch (error) {
    console.error("Error getting user contributions:", error)
    throw error
  }
}