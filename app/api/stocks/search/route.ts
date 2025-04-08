import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { getStockQuote } from "@/lib/stock-data-service"

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

    // Get stock quote with database caching and Finnhub fallback
    const quoteData = await getStockQuote(symbol)

    return NextResponse.json(quoteData)
  } catch (error) {
    console.error("Error searching stock:", error)
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 })
  }
}