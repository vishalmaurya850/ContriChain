import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { findMany, updateOne, createObjectId } from "@/lib/mongodb-admin"
import * as finnhub from "finnhub"

export async function POST() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Find predictions that need verification
    const unverifiedPredictions = await findMany(
      "stockPredictions",
      {
        actualOutcome: { $exists: false },
        createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // At least 1 day old
      },
      { limit: 50 },
    )

    if (unverifiedPredictions.length === 0) {
      return NextResponse.json({ message: "No predictions to verify" })
    }

    // Group predictions by symbol for efficient API usage
    interface Prediction {
      symbol: string;
      initialPrice: number;
      predictedPrice: number;
      predictedDirection: string;
      _id: string;
    }

    const predictionsBySymbol: Record<string, Prediction[]> = {};
    (unverifiedPredictions.map((doc) => ({
      symbol: doc.symbol,
      initialPrice: doc.initialPrice,
      predictedPrice: doc.predictedPrice,
      predictedDirection: doc.predictedDirection,
      _id: doc._id.toString(),
    }) as Prediction)).forEach((prediction: Prediction) => {
      if (!predictionsBySymbol[prediction.symbol]) {
        predictionsBySymbol[prediction.symbol] = []
      }
      predictionsBySymbol[prediction.symbol].push(prediction)
    })

    // Get current prices for each symbol
    const apiKey = process.env.FINNHUB_API_KEY || ""
    const results = []

    if (!apiKey) {
      // Mock verification for development
      for (const symbol in predictionsBySymbol) {
        const predictions = predictionsBySymbol[symbol]
        for (const prediction of predictions) {
          const mockPrice = prediction.initialPrice * (0.9 + Math.random() * 0.2)
          const actualDirection =
            mockPrice > prediction.initialPrice ? "up" : mockPrice < prediction.initialPrice ? "down" : "neutral"
          const predictedCorrectly = actualDirection === prediction.predictedDirection

          // Calculate accuracy based on direction and price difference
          const accuracy = predictedCorrectly ? 70 + Math.random() * 30 : Math.random() * 50

          // Update the prediction with actual outcome
          await updateOne(
            "stockPredictions",
            { _id: createObjectId(prediction._id.toString()) },
            {
              $set: {
                actualOutcome: {
                  actualPrice: mockPrice,
                  actualDirection,
                  accuracy,
                  verifiedAt: new Date(),
                },
              },
            },
          )

          results.push({
            id: prediction._id.toString(),
            symbol: prediction.symbol,
            initialPrice: prediction.initialPrice,
            predictedPrice: prediction.predictedPrice,
            actualPrice: mockPrice,
            accuracy,
          })
        }
      }
    } else {
      // Initialize Finnhub client
      const finnhubClient = new finnhub.DefaultApi()
      const apiClient = finnhub.ApiClient.instance
      apiClient.authentications["api_key"].apiKey = apiKey

      // Process each symbol
      for (const symbol in predictionsBySymbol) {
        try {
          const currentPrice = await new Promise<number>((resolve, reject) => {
            finnhubClient.quote(symbol, (error, data) => {
              if (error) {
                reject(error)
                return
              }
              resolve(data.c)
            })
          })

          // Update each prediction for this symbol
          const predictions = predictionsBySymbol[symbol]
          for (const prediction of predictions) {
            const actualDirection =
              currentPrice > prediction.initialPrice
                ? "up"
                : currentPrice < prediction.initialPrice
                  ? "down"
                  : "neutral"
            const predictedCorrectly = actualDirection === prediction.predictedDirection

            // Calculate accuracy based on direction and price difference
            const priceAccuracy =
              100 -
              Math.min(100, Math.abs(((currentPrice - prediction.predictedPrice) / prediction.initialPrice) * 100))
            const directionAccuracy = predictedCorrectly ? 100 : 0
            const accuracy = priceAccuracy * 0.7 + directionAccuracy * 0.3

            // Update the prediction with actual outcome
            await updateOne(
              "stockPredictions",
              { _id: createObjectId(prediction._id.toString()) },
              {
                $set: {
                  actualOutcome: {
                    actualPrice: currentPrice,
                    actualDirection,
                    accuracy,
                    verifiedAt: new Date(),
                  },
                },
              },
            )

            results.push({
              id: prediction._id.toString(),
              symbol: prediction.symbol,
              initialPrice: prediction.initialPrice,
              predictedPrice: prediction.predictedPrice,
              actualPrice: currentPrice,
              accuracy,
            })
          }
        } catch (error) {
          console.error(`Error verifying predictions for ${symbol}:`, error)
        }
      }
    }

    return NextResponse.json({
      verified: results.length,
      results,
    })
  } catch (error) {
    console.error("Error verifying predictions:", error)
    return NextResponse.json({ error: "Failed to verify predictions" }, { status: 500 })
  }
}