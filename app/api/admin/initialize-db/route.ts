import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { insertOne, findOne } from "@/lib/mongodb-admin"
import { generateMockMarketData } from "@/lib/market-data-service"

// Admin endpoint to initialize the database with required collections and sample data
export async function POST(): Promise<Response> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const results = {
      stockQuotes: false,
      marketData: false,
      stockPredictions: false,
      learningFeedback: false,
      chatSessions: false,
    }

    // Initialize stockQuotes collection with sample data
    try {
      const existingQuote = await findOne("stockQuotes", {})

      if (!existingQuote) {
        // Add sample stock quotes
        const sampleStocks = [
          {
            symbol: "AAPL",
            price: 187.68,
            change: 1.25,
            changePercent: 0.67,
            high: 188.45,
            low: 186.21,
            open: 186.5,
            prevClose: 186.43,
            timestamp: new Date(),
          },
          {
            symbol: "MSFT",
            price: 403.78,
            change: 3.45,
            changePercent: 0.86,
            high: 405.12,
            low: 400.33,
            open: 401.2,
            prevClose: 400.33,
            timestamp: new Date(),
          },
          {
            symbol: "GOOGL",
            price: 142.56,
            change: -0.87,
            changePercent: -0.61,
            high: 143.45,
            low: 141.98,
            open: 143.4,
            prevClose: 143.43,
            timestamp: new Date(),
          },
        ]

        for (const stock of sampleStocks) {
          await insertOne("stockQuotes", stock)
        }

        results.stockQuotes = true
      } else {
        results.stockQuotes = false
      }
    } catch (error) {
      console.error("Error initializing stockQuotes:", error)
    }

    // Initialize marketData collection
    try {
      const existingMarketData = await findOne("marketData", {})

      if (!existingMarketData) {
        const marketData = generateMockMarketData()
        await insertOne("marketData", marketData)
        results.marketData = true
      } else {
        results.marketData = false
      }
    } catch (error) {
      console.error("Error initializing marketData:", error)
    }

    // Initialize stockPredictions collection with sample data
    try {
      const existingPrediction = await findOne("stockPredictions", {})

      if (!existingPrediction) {
        // Add a sample prediction
        const samplePrediction = {
          userId: session.user.id,
          symbol: "AAPL",
          initialPrice: 187.68,
          predictedPrice: 195.5,
          predictedDirection: "up",
          confidence: 0.78,
          timeframe: "1 month",
          aiReasoning:
            "Apple's strong fundamentals, upcoming product releases, and historical performance suggest continued growth.",
          technicalFactors: ["Bullish moving average crossover", "Strong support at $180", "Increasing volume"],
          fundamentalFactors: ["Strong earnings report", "Growing services revenue", "Product innovation"],
          marketConditions: ["Tech sector strength", "Positive market sentiment"],
          createdAt: new Date(),
        }

        await insertOne("stockPredictions", samplePrediction)
        results.stockPredictions = true
      } else {
        results.stockPredictions = false
      }
    } catch (error) {
      console.error("Error initializing stockPredictions:", error)
    }

    return NextResponse.json({
      message: "Database initialization completed",
      results,
    })
  } catch (error) {
    console.error("Error initializing database:", error)
    return NextResponse.json({ error: "Failed to initialize database" }, { status: 500 })
  }
}