import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // If Alpha Vantage API key is not set, return mock data
    if (!process.env.ALPHA_VANTAGE_API_KEY) {
      return NextResponse.json([
        {
          symbol: "AAPL",
          price: 187.68,
          change: 1.25,
          changePercent: 0.67,
          prediction: {
            direction: "up",
            confidence: 0.78,
            target: 195.5,
            timeframe: "1 month",
          },
        },
        {
          symbol: "MSFT",
          price: 403.78,
          change: 3.45,
          changePercent: 0.86,
          prediction: {
            direction: "up",
            confidence: 0.82,
            target: 425.0,
            timeframe: "1 month",
          },
        },
        {
          symbol: "GOOGL",
          price: 142.56,
          change: -0.87,
          changePercent: -0.61,
          prediction: {
            direction: "neutral",
            confidence: 0.65,
            target: 145.0,
            timeframe: "1 month",
          },
        },
        {
          symbol: "TSLA",
          price: 177.89,
          change: -2.34,
          changePercent: -1.3,
          prediction: {
            direction: "down",
            confidence: 0.71,
            target: 165.0,
            timeframe: "1 month",
          },
        },
        {
          symbol: "AMZN",
          price: 178.12,
          change: 1.56,
          changePercent: 0.88,
          prediction: {
            direction: "up",
            confidence: 0.75,
            target: 190.0,
            timeframe: "1 month",
          },
        },
      ])
    }

    // In a real implementation, fetch trending stocks from Alpha Vantage API
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY
    const symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"]
    const stockData = []

    for (const symbol of symbols) {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${apiKey}`,
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch data for ${symbol}`)
      }

      const data = await response.json()
      const quote = data["Global Quote"]

      if (!quote || Object.keys(quote).length === 0) {
        continue
      }

      stockData.push({
        symbol,
        price: Number.parseFloat(quote["05. price"]),
        change: Number.parseFloat(quote["09. change"]),
        changePercent: Number.parseFloat(quote["10. change percent"].replace("%", "")),
        // Add AI prediction (this would come from a real AI model in production)
        prediction: {
          direction: Math.random() > 0.5 ? "up" : Math.random() > 0.5 ? "down" : "neutral",
          confidence: 0.6 + Math.random() * 0.3,
          target: Number.parseFloat(quote["05. price"]) * (0.9 + Math.random() * 0.2),
          timeframe: "1 month",
        },
      })
    }

    return NextResponse.json(stockData)
  } catch (error) {
    console.error("Error fetching trending stocks:", error)
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 })
  }
}

