import clientPromise from "./mongodb"
import { ObjectId } from "mongodb"
import type { Transaction } from "./models/types"

export async function getAllTransactions(options?: {
  page?: number
  limit?: number
  status?: string
}): Promise<{
  transactions: Transaction[]
  totalPages: number
  totalCount: number
}> {
  try {
    const client = await clientPromise
    const db = client.db()

    const page = options?.page || 1
    const limit = options?.limit || 10
    const skip = (page - 1) * limit

    const query: Record<string, string> = {}

    if (options?.status && options.status !== "all") {
      query.status = options.status
    }

    // Get total count for pagination
    const totalCount = await db.collection("transactions").countDocuments(query)

    // Get transactions with pagination
    const transactions = await db
      .collection("transactions")
      .find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    return {
      transactions: transactions as Transaction[],
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
    }
  } catch (error) {
    console.error("Error getting transactions:", error)
    throw error
  }
}

export async function getTransactionsByUser(userId: string): Promise<Transaction[]> {
  try {
    const client = await clientPromise
    const db = client.db()

    const transactions = await db.collection("transactions").find({ userId }).sort({ timestamp: -1 }).toArray()

    return transactions as Transaction[]
  } catch (error) {
    console.error("Error getting user transactions:", error)
    throw error
  }
}

export async function getTransactionsByCampaign(campaignId: string): Promise<Transaction[]> {
  try {
    const client = await clientPromise
    const db = client.db()

    const transactions = await db.collection("transactions").find({ campaignId }).sort({ timestamp: -1 }).toArray()

    return transactions as Transaction[]
  } catch (error) {
    console.error("Error getting campaign transactions:", error)
    throw error
  }
}

export async function createTransaction(data: Omit<Transaction, "_id">): Promise<Transaction> {
  try {
    const client = await clientPromise
    const db = client.db()

    const result = await db.collection("transactions").insertOne(data)

    return {
      ...data,
      _id: result.insertedId,
    }
  } catch (error) {
    console.error("Error creating transaction:", error)
    throw error
  }
}

export async function updateTransactionStatus(
  transactionId: string,
  status: "pending" | "confirmed" | "failed",
): Promise<boolean> {
  try {
    const client = await clientPromise
    const db = client.db()

    const result = await db.collection("transactions").updateOne(
      { _id: new ObjectId(transactionId) },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      },
    )

    return result.modifiedCount === 1
  } catch (error) {
    console.error("Error updating transaction status:", error)
    throw error
  }
}