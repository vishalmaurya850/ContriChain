import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get("symbol")

    if (!symbol) {
      return NextResponse.json({ error: "Symbol parameter is required" }, { status: 400 })
    }

    // If Alpha Vantage API key is not set, return mock data
    if (!process.env.ALPHA_VANTAGE_API_KEY) {
      // Generate mock data based on the symbol
      const mockPrice = 100 + (symbol.charCodeAt(0) % 10) * 10 + Math.random() * 50
      const mockChange = Math.random() * 6 - 3
      const mockChangePercent = (mockChange / mockPrice) * 100

      return NextResponse.json({
        symbol: symbol.toUpperCase(),
        price: mockPrice,
        change: mockChange,
        changePercent: mockChangePercent,
        prediction: {
          direction: mockChange > 0 ? "up" : mockChange < 0 ? "down" : "neutral",
          confidence: 0.6 + Math.random() * 0.3,
          target: mockPrice * (0.9 + Math.random() * 0.2),
          timeframe: "1 month",
        },
      })
    }

    // In a real implementation, fetch stock data from Alpha Vantage API
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`,
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch data for ${symbol}`)
    }

    const data = await response.json()
    const quote = data["Global Quote"]

    if (!quote || Object.keys(quote).length === 0) {
      return NextResponse.json({ error: "Stock not found" }, { status: 404 })
    }

    // Get AI prediction for the stock
    // In a real implementation, this would come from a machine learning model
    const stockData = {
      symbol: symbol.toUpperCase(),
      price: Number.parseFloat(quote["05. price"]),
      change: Number.parseFloat(quote["09. change"]),
      changePercent: Number.parseFloat(quote["10. change percent"].replace("%", "")),
      prediction: {
        direction:
          Number.parseFloat(quote["09. change"]) > 0
            ? "up"
            : Number.parseFloat(quote["09. change"]) < 0
              ? "down"
              : "neutral",
        confidence: 0.6 + Math.random() * 0.3,
        target: Number.parseFloat(quote["05. price"]) * (0.9 + Math.random() * 0.2),
        timeframe: "1 month",
      },
    }

    return NextResponse.json(stockData)
  } catch (error) {
    console.error("Error searching stock:", error)
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 })
  }
}