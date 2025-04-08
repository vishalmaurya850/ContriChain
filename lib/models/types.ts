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

export interface ChatMessage {
  _id?: ObjectId
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export interface ChatSession {
  _id?: ObjectId
  userId: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
  category: "stocks" | "funding"
}

export interface StockPrediction {
  _id?: ObjectId
  userId: string
  symbol: string
  initialPrice: number
  predictedPrice: number
  predictedDirection: "up" | "down" | "neutral"
  confidence: number
  timeframe: string
  createdAt: Date
  actualOutcome?: {
    actualPrice: number
    actualDirection: "up" | "down" | "neutral"
    accuracy: number
    verifiedAt: Date
  }
  aiReasoning: string
  technicalFactors: string[]
  fundamentalFactors: string[]
  marketConditions: string[]
}

export interface StockAnalysisRequest {
  symbol: string
  message: string
  sessionId?: string
  includeHistoricalData?: boolean
  timeframe?: "short" | "medium" | "long"
}

export interface LearningFeedback {
  _id?: ObjectId
  predictionId: string
  userId: string
  accuracy: number
  feedback: string
  createdAt: Date
}

export interface MarketData {
  _id?: ObjectId
  date: Date
  indicators: {
    vix?: number
    fedRate?: number
    unemployment?: number
    gdp?: number
    inflation?: number
    [key: string]: number | undefined
  }
  majorIndices: {
    [index: string]: {
      value: number
      change: number
      changePercent: number
    }
  }
  sectorPerformance: {
    [sector: string]: {
      change: number
      changePercent: number
    }
  }
}