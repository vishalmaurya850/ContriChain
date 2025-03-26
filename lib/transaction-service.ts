import { findMany, countDocuments, insertOne, updateOne, createObjectId } from "@/lib/mongodb-admin"
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
    const page = options?.page || 1
    const limit = options?.limit || 10
    const skip = (page - 1) * limit

    const query: Record<string, string | number | boolean> = {}

    if (options?.status && options.status !== "all") {
      query.status = options.status
    }

    // Get total count for pagination
    const totalCount = await countDocuments("transactions", query)

    // Get transactions with pagination
    const transactions = await findMany("transactions", query, {
      sort: { timestamp: -1 },
      skip,
      limit,
    })

    return {
      transactions: transactions.map((tx) => ({
        id: tx._id.toString(),
        type: tx.type,
        campaignId: tx.campaignId,
        campaignTitle: tx.campaignTitle,
        userId: tx.userId,
        userName: tx.userName || "", // Default to empty string if not present
        transactionHash: tx.transactionHash || "", // Default to empty string if not present
        amount: tx.amount,
        status: tx.status,
        timestamp: tx.timestamp,
        updatedAt: tx.updatedAt,
      })) as Transaction[],
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
    const transactions = await findMany("transactions", { userId }, { sort: { timestamp: -1 } })

    return transactions.map((tx) => ({
      id: tx._id.toString(),
      type: tx.type,
      campaignId: tx.campaignId,
      campaignTitle: tx.campaignTitle,
      userId: tx.userId,
      userName: tx.userName || "", // Default to empty string if not present
      transactionHash: tx.transactionHash || "", // Default to empty string if not present
      amount: tx.amount,
      status: tx.status,
      timestamp: tx.timestamp,
      updatedAt: tx.updatedAt,
    })) as Transaction[]
  } catch (error) {
    console.error("Error getting user transactions:", error)
    throw error
  }
}

export async function getTransactionsByCampaign(campaignId: string): Promise<Transaction[]> {
  try {
    const transactions = await findMany("transactions", { campaignId }, { sort: { timestamp: -1 } })

    return transactions.map((tx) => ({
      id: tx._id.toString(),
      type: tx.type,
      campaignId: tx.campaignId,
      campaignTitle: tx.campaignTitle,
      userId: tx.userId,
      userName: tx.userName || "", // Default to empty string if not present
      transactionHash: tx.transactionHash || "", // Default to empty string if not present
      amount: tx.amount,
      status: tx.status,
      timestamp: tx.timestamp,
      updatedAt: tx.updatedAt,
    })) as Transaction[]
  } catch (error) {
    console.error("Error getting campaign transactions:", error)
    throw error
  }
}

export async function createTransaction(data: Omit<Transaction, "id">): Promise<Transaction> {
  try {
    const result = await insertOne("transactions", data as unknown as Document)

    return {
      id: result.insertedId.toString(),
      ...data,
    } as Transaction
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
    const result = await updateOne(
      "transactions",
      { _id: createObjectId(transactionId) },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      },
    ) as { modifiedCount: number }

    return result.modifiedCount === 1
  } catch (error) {
    console.error("Error updating transaction status:", error)
    throw error
  }
}

