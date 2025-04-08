import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { findMany, insertOne, updateOne } from "@/lib/mongodb-admin"
import finnhubClient, { safeApiCall } from "@/lib/finnhub-client"
import type * as finnhub from "finnhub"

// This endpoint is used to sync stock data from Finnhub to the database
// It can be called manually or scheduled to run periodically
export async function POST(request: Request): Promise<Response> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"] } = await request.json()

    const results = []
    const apiKey = process.env.FINNHUB_API_KEY || ""

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Finnhub API key not configured",
          message: "Using mock data instead",
        },
        { status: 200 },
      )
    }

    for (const symbol of symbols) {
      try {
        // Fetch quote from Finnhub
        const quote = await safeApiCall<finnhub.Quote>((callback) => finnhubClient.quote(symbol, callback))

        // Format the data
        const quoteData = {
          symbol: symbol.toUpperCase(),
          price: quote.c,
          change: quote.d,
          changePercent: quote.dp,
          high: quote.h,
          low: quote.l,
          open: quote.o,
          prevClose: quote.pc,
          timestamp: new Date(),
        }

        // Check if we already have this stock in the database
        const existingQuote = await findMany("stockQuotes", { symbol: symbol.toUpperCase() }, { limit: 1 })

        if (existingQuote && existingQuote.length > 0) {
          // Update existing record
          await updateOne("stockQuotes", { symbol: symbol.toUpperCase() }, { $set: quoteData })
        } else {
          // Insert new record
          await insertOne("stockQuotes", quoteData)
        }

        results.push({
          symbol: symbol.toUpperCase(),
          status: "success",
        })
      } catch (error) {
        console.error(`Error syncing data for ${symbol}:`, error)
        results.push({
          symbol: symbol.toUpperCase(),
          status: "error",
          message: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    return NextResponse.json({
      synced: results.filter((r) => r.status === "success").length,
      failed: results.filter((r) => r.status === "error").length,
      results,
    })
  } catch (error) {
    console.error("Error syncing stock data:", error)
    return NextResponse.json({ error: "Failed to sync stock data" }, { status: 500 })
  }
}