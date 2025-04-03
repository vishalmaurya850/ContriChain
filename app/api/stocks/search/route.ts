import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import * as finnhub from "finnhub"

export async function GET(request: Request): Promise<Response> {
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

    // If API key is not set, return mock data
    const apiKey = process.env.FINNHUB_API_KEY || ""
    if (!apiKey) {
      // Generate mock data based on the symbol
      const mockPrice = 100 + (symbol.charCodeAt(0) % 10) * 10 + Math.random() * 50
      const mockChange = Math.random() * 6 - 3
      const mockChangePercent = (mockChange / mockPrice) * 100

      return NextResponse.json({
        symbol: symbol.toUpperCase(),
        price: mockPrice,
        change: mockChange,
        changePercent: mockChangePercent,
        high: mockPrice + Math.random() * 5,
        low: mockPrice - Math.random() * 5,
        open: mockPrice - Math.random() * 2,
        prevClose: mockPrice - mockChange,
        prediction: {
          direction: mockChange > 0 ? "up" : mockChange < 0 ? "down" : "neutral",
          confidence: 0.6 + Math.random() * 0.3,
          target: mockPrice * (0.9 + Math.random() * 0.2),
          timeframe: "1 month",
        },
      })
    }

    // Fetch real data from Finnhub
    try {
      // Initialize Finnhub client
      const finnhubClient = new finnhub.DefaultApi()

      // Set API key directly on the authentication object
      const apiClient = finnhub.ApiClient.instance
      apiClient.authentications["api_key"].apiKey = apiKey

      const stockData = await new Promise<Record<string, unknown>>((resolve, reject) => {
        finnhubClient.quote(symbol.toUpperCase(), (error, data) => {
          if (error) {
            reject(error)
            return
          }

          if (!data || !data.c) {
            resolve({
              error: "Stock not found or unsupported symbol",
              symbol: symbol.toUpperCase(),
            });
            return;
          }
          // Generate AI prediction (this would come from a real AI model in production)
          const direction = data.dp > 0 ? "up" : data.dp < 0 ? "down" : "neutral"
          const confidence = 0.6 + Math.random() * 0.3
          const targetMultiplier =
            direction === "up"
              ? 1 + Math.random() * 0.1
              : direction === "down"
                ? 0.9 + Math.random() * 0.1
                : 0.95 + Math.random() * 0.1

          resolve({
            symbol: symbol.toUpperCase(),
            price: data.c,
            change: data.d,
            changePercent: data.dp,
            high: data.h,
            low: data.l,
            open: data.o,
            prevClose: data.pc,
            prediction: {
              direction,
              confidence,
              target: Number.parseFloat((data.c * targetMultiplier).toFixed(2)),
              timeframe: "1 month",
            },
          })
        })
      })

      return NextResponse.json(stockData)
    } catch (finnhubError) {
      console.error("Finnhub API error:", finnhubError)
      return NextResponse.json({ error: "Stock not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error searching stock:", error)
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 })
  }
}