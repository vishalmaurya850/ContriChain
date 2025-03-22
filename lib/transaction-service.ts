export interface Transaction {
  id: string
  type: "contribution" | "claim" | "refund"
  campaignId: string
  campaignTitle: string
  userId: string
  userName: string
  amount: number
  transactionHash: string
  timestamp: Date
  status: "pending" | "confirmed" | "failed"
}

// Sample data for development
const sampleTransactions: Transaction[] = [
  {
    id: "1",
    type: "contribution",
    campaignId: "1",
    campaignTitle: "Sustainable Energy Project",
    userId: "user1",
    userName: "Alice Johnson",
    amount: 0.5,
    transactionHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    status: "confirmed",
  },
  {
    id: "2",
    type: "contribution",
    campaignId: "2",
    campaignTitle: "Educational Platform",
    userId: "user2",
    userName: "Bob Smith",
    amount: 0.2,
    transactionHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    status: "confirmed",
  },
  {
    id: "3",
    type: "claim",
    campaignId: "3",
    campaignTitle: "Community Art Initiative",
    userId: "user3",
    userName: "Charlie Davis",
    amount: 1.0,
    transactionHash: "0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    status: "confirmed",
  },
  {
    id: "4",
    type: "contribution",
    campaignId: "1",
    campaignTitle: "Sustainable Energy Project",
    userId: "user4",
    userName: "Diana Wilson",
    amount: 0.3,
    transactionHash: "0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc",
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    status: "pending",
  },
  {
    id: "5",
    type: "refund",
    campaignId: "4",
    campaignTitle: "Healthcare Innovation",
    userId: "user5",
    userName: "Ethan Brown",
    amount: 0.4,
    transactionHash: "0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    status: "confirmed",
  },
]

export async function getAllTransactions(options?: {
  page?: number
  limit?: number
  status?: string
}) {
  // In a real implementation, this would fetch from the database
  // For now, return sample data

  const page = options?.page || 1
  const pageSize = options?.limit || 10
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize

  let filteredTransactions = [...sampleTransactions]

  if (options?.status && options.status !== "all") {
    filteredTransactions = filteredTransactions.filter((t) => t.status === options.status)
  }

  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex)

  return {
    transactions: paginatedTransactions,
    totalPages: Math.ceil(filteredTransactions.length / pageSize),
    totalCount: filteredTransactions.length,
  }
}

export async function getTransactionsByUser(userId: string) {
  // In a real implementation, this would fetch from the database
  // For now, filter sample data
  return sampleTransactions.filter((t) => t.userId === userId)
}

export async function getTransactionsByCampaign(campaignId: string) {
  // In a real implementation, this would fetch from the database
  // For now, filter sample data
  return sampleTransactions.filter((t) => t.campaignId === campaignId)
}

