import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { getTrendingStocks } from "@/lib/stock-data-service"

export async function GET(): Promise<Response> {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get trending stocks with database caching and Finnhub fallback
    const trendingStocks = await getTrendingStocks()

    return NextResponse.json(trendingStocks)
  } catch (error) {
    console.error("Error fetching trending stocks:", error)
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 })
  }
}