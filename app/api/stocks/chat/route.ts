import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { z } from "zod"
import { findOne, updateOne, insertOne, createObjectId, findMany } from "@/lib/mongodb-admin"
import { generateStockAnalysis } from "@/lib/gemini-client"
import { generateAIPrediction } from "@/lib/stock-prediction-service"
import type { ChatMessage } from "@/lib/models/types"

// Schema for chat request - fixing sessionId to accept null
const chatSchema = z.object({
  message: z.string().min(1, "Message must not be empty"),
  // Allow sessionId to be string OR null OR undefined
  sessionId: z.string().nullable().optional(),
  symbol: z.string().optional(),
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Parse request body with better error handling
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("Error parsing request body:", parseError)
      return NextResponse.json(
        {
          error: "Invalid JSON in request body",
          details: "Please ensure your request contains valid JSON data",
        },
        { status: 400 },
      )
    }

    // Validate with detailed error messages
    try {
      const { message, sessionId, symbol } = chatSchema.parse(body)

      // Ensure message is not empty after trimming
      if (!message.trim()) {
        return NextResponse.json(
          {
            error: "Invalid request data",
            details: "Message cannot be empty",
          },
          { status: 400 },
        )
      }

      // Create a new user message
      const userMessage: ChatMessage = {
        role: "user",
        content: message,
        timestamp: new Date(),
      }

      // Check if the message is about a specific stock
      const stockSymbol = symbol || extractStockSymbol(message)
      let aiResponse = ""
      let prediction = null

      try {
        if (stockSymbol) {
          try {
            // Generate AI prediction for the stock
            prediction = await generateAIPrediction(stockSymbol, message)

            // Store the prediction in the database
            const predictionData = {
              userId: session.user.id,
              symbol: stockSymbol,
              initialPrice: prediction.currentPrice,
              predictedPrice: prediction.predictedPrice,
              predictedDirection: prediction.predictedDirection,
              confidence: prediction.confidence,
              timeframe: prediction.timeframe,
              aiReasoning: prediction.analysis,
              technicalFactors: prediction.technicalFactors || [],
              fundamentalFactors: prediction.fundamentalFactors || [],
              marketConditions: prediction.marketConditions || [],
              createdAt: new Date(),
            }

            await insertOne("stockPredictions", predictionData)

            // Use the prediction analysis as the response
            aiResponse = prediction.analysis
          } catch (predictionError) {
            console.error("Error generating stock prediction:", predictionError)

            // Fall back to general stock analysis if prediction fails
            const stockData = await findOne("stockQuotes", { symbol: stockSymbol.toUpperCase() })
            aiResponse = await generateStockAnalysis(message, stockData || undefined)
          }
        } else {
          // For general market questions, get relevant market data
          const marketData = await findOne("marketData", {})

          // Get recent chat history for context
          const recentChats = await findMany(
            "chatSessions",
            { userId: session.user.id, category: "stocks" },
            { sort: { updatedAt: -1 }, limit: 3 },
          )

          const chatHistory = recentChats
            .flatMap((chat) =>
              chat.messages.map((msg: { role: string; content: string }) => ({
                userMessage: msg.role === "user" ? msg.content : "",
                aiResponse: msg.role === "assistant" ? msg.content : "",
              })),
            )
            .filter((item) => item.userMessage && item.aiResponse)

          // Generate response using Gemini
          aiResponse = await generateStockAnalysis(message, marketData || undefined, chatHistory)
        }
      } catch (aiError) {
        console.error("Error generating AI response:", aiError)
        // Provide a fallback response instead of failing
        aiResponse =
          "I'm sorry, I encountered an issue while analyzing your request. Please try again with a different question or check back later."
      }

      // Create assistant message
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      }

      let newSessionId = sessionId

      // If sessionId is provided and not null, update existing session
      if (sessionId) {
        try {
          const chatSession = await findOne("chatSessions", {
            _id: createObjectId(sessionId),
            userId: session.user.id,
          })

          if (!chatSession) {
            return NextResponse.json({ error: "Chat session not found" }, { status: 404 })
          }

          // Update the session with new messages
          await updateOne(
            "chatSessions",
            { _id: createObjectId(sessionId) },
            {
              $push: {
                messages: { $each: [userMessage, assistantMessage] },
              },
              $set: { updatedAt: new Date() },
            },
          )
        } catch (sessionError) {
          console.error("Error updating session:", sessionError)
          // If session update fails, create a new session instead
          newSessionId = null
        }
      }

      // Create a new session if sessionId is null or undefined
      if (!newSessionId) {
        // Generate a title based on the first message
        const title = generateSessionTitle(message, stockSymbol)

        const result = await insertOne("chatSessions", {
          userId: session.user.id,
          title,
          messages: [userMessage, assistantMessage],
          createdAt: new Date(),
          updatedAt: new Date(),
          category: "stocks",
        })

        newSessionId = result.insertedId.toString()
      }

      return NextResponse.json({
        response: aiResponse,
        sessionId: newSessionId,
        prediction: prediction,
      })
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        // Extract and format validation errors
        const errorDetails = validationError.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }))

        return NextResponse.json(
          {
            error: "Invalid request data",
            details: errorDetails,
          },
          { status: 400 },
        )
      }
      throw validationError
    }
  } catch (error) {
    console.error("Error in chat API route:", error)
    return NextResponse.json(
      {
        error: "Failed to generate response",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Helper function to extract stock symbol from message
function extractStockSymbol(message: string): string | null {
  // Look for ticker symbols in the message (e.g., $AAPL, TSLA, MSFT)
  const tickerRegex = /\$?([A-Z]{1,5})\b/g
  const matches = [...message.matchAll(tickerRegex)]

  if (matches.length > 0) {
    // Return the first match without the $ if present
    return matches[0][1]
  }

  // Look for company names
  const companyMap: Record<string, string> = {
    apple: "AAPL",
    microsoft: "MSFT",
    amazon: "AMZN",
    google: "GOOGL",
    alphabet: "GOOGL",
    tesla: "TSLA",
    facebook: "META",
    meta: "META",
    netflix: "NFLX",
    nvidia: "NVDA",
  }

  const lowerMessage = message.toLowerCase()
  for (const [company, ticker] of Object.entries(companyMap)) {
    if (lowerMessage.includes(company)) {
      return ticker
    }
  }

  return null
}

// Generate a session title based on the message
function generateSessionTitle(message: string, stockSymbol: string | null): string {
  if (stockSymbol) {
    return `${stockSymbol} Stock Analysis`
  }

  if (message.length <= 30) {
    return message
  }

  // Extract key topics from the message
  const topics = [
    "market",
    "stock",
    "invest",
    "portfolio",
    "trend",
    "analysis",
    "prediction",
    "forecast",
    "dividend",
    "earnings",
    "strategy",
  ]

  for (const topic of topics) {
    if (message.toLowerCase().includes(topic)) {
      const index = message.toLowerCase().indexOf(topic)
      const start = Math.max(0, message.lastIndexOf(" ", index - 15) + 1)
      const end = Math.min(message.length, message.indexOf(" ", index + topic.length + 15))
      if (end > start) {
        return message.substring(start, end) + "..."
      }
    }
  }

  // Default to first 30 chars if no topics found
  return message.substring(0, 30) + "..."
}
