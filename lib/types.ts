import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  name: string
  email: string
  image?: string
  walletAddress?: string
  isAdmin: boolean
  createdAt: Date
  updatedAt?: Date
}

export interface Campaign {
  _id?: ObjectId
  title: string
  description: string
  goal: number
  raised: number
  deadline: number
  userId: string
  userName: string
  userImage?: string
  imageUrl?: string
  status: "active" | "paused" | "completed" | "refunded"
  category: string
  createdAt: Date
  updatedAt?: Date
  onChainId: string
  transactionHash: string
  claimed?: boolean
}

export interface Contribution {
  _id?: ObjectId
  campaignId: string
  campaignTitle: string
  userId: string
  userName: string
  userImage?: string
  amount: number
  transactionHash: string
  timestamp: Date
}

export interface CampaignUpdate {
  _id?: ObjectId
  campaignId: string
  userId: string
  userName: string
  title?: string
  content: string
  timestamp: Date
}

export interface Transaction {
  _id?: ObjectId
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

