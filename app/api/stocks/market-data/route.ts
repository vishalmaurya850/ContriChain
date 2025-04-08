import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { findOne, insertOne } from "@/lib/mongodb-admin"

export async function GET(): Promise<Response> {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get the latest market data
    const marketData = await findOne("marketData", {})

    if (!marketData) {
      // If no market data exists, create mock data
      const mockData = generateMockMarketData()
      await insertOne("marketData", mockData)

      return NextResponse.json({
        ...mockData,
        _id: undefined,
      })
    }

    return NextResponse.json({
      ...marketData,
      _id: undefined,
    })
  } catch (error) {
    console.error("Error fetching market data:", error)
    return NextResponse.json({ error: "Failed to fetch market data" }, { status: 500 })
  }
}

// Generate mock market data for development
function generateMockMarketData() {
  const today = new Date()

  return {
    date: today,
    indicators: {
      vix: 15 + Math.random() * 10,
      fedRate: 5.25 + (Math.random() * 0.5 - 0.25),
      unemployment: 3.5 + Math.random(),
      gdp: 2 + Math.random() * 2,
      inflation: 3 + Math.random(),
    },
    majorIndices: {
      "S&P 500": {
        value: 5000 + Math.random() * 200,
        change: Math.random() * 40 - 20,
        changePercent: Math.random() * 2 - 1,
      },
      "Dow Jones": {
        value: 38000 + Math.random() * 1000,
        change: Math.random() * 300 - 150,
        changePercent: Math.random() * 2 - 1,
      },
      Nasdaq: {
        value: 16000 + Math.random() * 500,
        change: Math.random() * 150 - 75,
        changePercent: Math.random() * 2 - 1,
      },
    },
    sectorPerformance: {
      Technology: {
        change: Math.random() * 4 - 2,
        changePercent: Math.random() * 4 - 2,
      },
      Healthcare: {
        change: Math.random() * 3 - 1.5,
        changePercent: Math.random() * 3 - 1.5,
      },
      Financials: {
        change: Math.random() * 2.5 - 1.25,
        changePercent: Math.random() * 2.5 - 1.25,
      },
      "Consumer Discretionary": {
        change: Math.random() * 3 - 1.5,
        changePercent: Math.random() * 3 - 1.5,
      },
      Energy: {
        change: Math.random() * 4 - 2,
        changePercent: Math.random() * 4 - 2,
      },
    },
  }
}