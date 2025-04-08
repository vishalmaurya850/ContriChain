import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { insertOne } from "@/lib/mongodb-admin"
import { getTrendingStocks } from "@/lib/stock-data-service"
import { generateMockMarketData } from "@/lib/market-data-service"

// Admin endpoint to sync all necessary data
export async function POST(): Promise<Response> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const results = {
      stocks: { success: 0, failed: 0 },
      marketData: { success: false },
    }

    // Sync stock data
    try {
      const symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA", "NFLX"]
      const stocks = await getTrendingStocks()
      results.stocks.success = stocks.length
      results.stocks.failed = symbols.length - stocks.length
    } catch (error) {
      console.error("Error syncing stocks:", error)
      results.stocks.failed = 1
    }

    // Sync market data
    try {
      const marketData = generateMockMarketData()
      await insertOne("marketData", marketData)
      results.marketData.success = true
    } catch (error) {
      console.error("Error syncing market data:", error)
    }

    return NextResponse.json({
      message: "Data sync completed",
      results,
    })
  } catch (error) {
    console.error("Error in data sync:", error)
    return NextResponse.json({ error: "Failed to sync data" }, { status: 500 })
  }
}