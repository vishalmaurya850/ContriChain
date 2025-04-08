import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { z } from "zod"
import { findMany } from "@/lib/mongodb-admin"
import { generateAIPrediction } from "@/lib/stock-prediction-service"

// Schema for prediction request
const predictionRequestSchema = z.object({
  symbol: z.string().min(1),
  timeframe: z.enum(["short", "medium", "long"]).optional(),
})

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get URL parameters
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get("symbol")

    if (!symbol) {
      return NextResponse.json({ error: "Symbol parameter is required" }, { status: 400 })
    }

    // Get predictions for the symbol
    const predictions = await findMany(
      "stockPredictions",
      { symbol: symbol.toUpperCase() },
      { sort: { createdAt: -1 }, limit: 10 },
    )

    return NextResponse.json(
      predictions.map((prediction) => ({
        id: prediction._id.toString(),
        ...prediction,
        _id: undefined,
      })),
    )
  } catch (error) {
    console.error("Error fetching predictions:", error)
    return NextResponse.json({ error: "Failed to fetch predictions" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { symbol, timeframe } = predictionRequestSchema.parse(body)

    // Generate prediction
    const prediction = await generateAIPrediction(
      symbol,
      `Provide a ${timeframe || "medium"}-term prediction for ${symbol}`,
    )

    return NextResponse.json(prediction)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
    }

    console.error("Error generating prediction:", error)
    return NextResponse.json({ error: "Failed to generate prediction" }, { status: 500 })
  }
}