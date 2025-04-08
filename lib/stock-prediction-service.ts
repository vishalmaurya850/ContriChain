import { findMany, findOne, insertOne, updateOne, createObjectId } from "@/lib/mongodb-admin"
import { generateStockAnalysis, analyzeHistoricalPredictions } from "@/lib/gemini-client"
import type { StockPrediction, LearningFeedback } from "@/lib/models/types"

// Create a new stock prediction
export async function createStockPrediction(data: {
  userId: string
  symbol: string
  initialPrice: number
  predictedPrice: number
  predictedDirection: "up" | "down" | "neutral"
  confidence: number
  timeframe: string
  aiReasoning: string
  technicalFactors: string[]
  fundamentalFactors: string[]
  marketConditions: string[]
}): Promise<StockPrediction> {
  try {
    const prediction = {
      ...data,
      createdAt: new Date(),
    }

    const result = await insertOne("stockPredictions", prediction)

    return {
      id: result.insertedId.toString(),
      ...prediction,
    } as StockPrediction
  } catch (error) {
    console.error("Error creating stock prediction:", error)
    throw error
  }
}

// Get predictions for a specific stock
export async function getStockPredictions(symbol: string): Promise<StockPrediction[]> {
  try {
    const predictions = await findMany(
      "stockPredictions",
      { symbol: symbol.toUpperCase() },
      { sort: { createdAt: -1 } },
    )

    return predictions.map((prediction) => ({
      id: prediction._id.toString(),
      userId: prediction.userId,
      symbol: prediction.symbol,
      initialPrice: prediction.initialPrice,
      predictedPrice: prediction.predictedPrice,
      predictedDirection: prediction.predictedDirection,
      confidence: prediction.confidence,
      timeframe: prediction.timeframe,
      aiReasoning: prediction.aiReasoning,
      technicalFactors: prediction.technicalFactors,
      fundamentalFactors: prediction.fundamentalFactors,
      marketConditions: prediction.marketConditions,
      createdAt: prediction.createdAt,
      actualOutcome: prediction.actualOutcome,
    })) as StockPrediction[]
  } catch (error) {
    console.error("Error getting stock predictions:", error)
    throw error
  }
}

// Get predictions made by a specific user
export async function getUserPredictions(userId: string): Promise<StockPrediction[]> {
  try {
    const predictions = await findMany("stockPredictions", { userId }, { sort: { createdAt: -1 } })

    return predictions.map((prediction) => ({
      id: prediction._id.toString(),
      userId: prediction.userId,
      symbol: prediction.symbol,
      initialPrice: prediction.initialPrice,
      predictedPrice: prediction.predictedPrice,
      predictedDirection: prediction.predictedDirection,
      confidence: prediction.confidence,
      timeframe: prediction.timeframe,
      aiReasoning: prediction.aiReasoning,
      technicalFactors: prediction.technicalFactors,
      fundamentalFactors: prediction.fundamentalFactors,
      marketConditions: prediction.marketConditions,
      createdAt: prediction.createdAt,
      actualOutcome: prediction.actualOutcome,
    })) as StockPrediction[]
  } catch (error) {
    console.error("Error getting user predictions:", error)
    throw error
  }
}

// Update a prediction with actual outcome
export async function updatePredictionOutcome(
  predictionId: string,
  data: {
    actualPrice: number
    actualDirection: "up" | "down" | "neutral"
    accuracy: number
  },
): Promise<boolean> {
  try {
    const result = await updateOne(
      "stockPredictions",
      { _id: createObjectId(predictionId) },
      {
        $set: {
          actualOutcome: {
            ...data,
            verifiedAt: new Date(),
          },
        },
      },
    )

    return result.modifiedCount === 1
  } catch (error) {
    console.error("Error updating prediction outcome:", error)
    throw error
  }
}

// Add learning feedback for a prediction
export async function addLearningFeedback(data: {
  predictionId: string
  userId: string
  accuracy: number
  feedback: string
}): Promise<LearningFeedback> {
  try {
    const feedback = {
      ...data,
      createdAt: new Date(),
    }

    const result = await insertOne("learningFeedback", feedback)

    return {
      id: result.insertedId.toString(),
      ...feedback,
    } as LearningFeedback
  } catch (error) {
    console.error("Error adding learning feedback:", error)
    throw error
  }
}

// Get relevant historical predictions for a symbol to improve future predictions
export async function getRelevantHistoricalData(symbol: string, limit = 10): Promise<{
  predictions: {
    id: string;
    symbol: string;
    initialPrice: number;
    predictedPrice: number;
    predictedDirection: "up" | "down" | "neutral";
    confidence: number;
    timeframe: string;
    actualPrice?: number;
    actualDirection?: "up" | "down" | "neutral";
    accuracy?: number;
    technicalFactors: string[];
    fundamentalFactors: string[];
    marketConditions: string[];
    createdAt: Date;
    verifiedAt?: Date;
  }[];
  marketData: Record<string, unknown>[];
  analysis: unknown;
}> {
  try {
    // Get completed predictions with actual outcomes
    const completedPredictions = await findMany(
      "stockPredictions",
      {
        symbol: symbol.toUpperCase(),
        "actualOutcome.verifiedAt": { $exists: true },
      },
      {
        sort: { "actualOutcome.verifiedAt": -1 },
        limit,
      },
    )

    // Get market data from the same time periods
    const predictionDates = completedPredictions.map((p) => new Date(p.createdAt))
    const marketData = await findMany("marketData", {
      date: {
        $in: predictionDates.map((date) => ({
          $gte: new Date(date.getTime() - 24 * 60 * 60 * 1000),
          $lte: new Date(date.getTime() + 24 * 60 * 60 * 1000),
        })),
      },
    })

    // Analyze the historical predictions to improve future ones
const formattedPredictions = completedPredictions.map((p) => ({
  id: p._id.toString(),
  symbol: p.symbol,
  initialPrice: p.initialPrice,
  predictedPrice: p.predictedPrice,
  predictedDirection: p.predictedDirection,
  confidence: p.confidence,
  timeframe: p.timeframe,
  actualPrice: p.actualOutcome?.actualPrice,
  actualDirection: p.actualOutcome?.actualDirection,
  accuracy: p.actualOutcome?.accuracy,
  technicalFactors: p.technicalFactors,
  fundamentalFactors: p.fundamentalFactors,
  marketConditions: p.marketConditions, // Ensure marketConditions is included
  createdAt: p.createdAt,
  verifiedAt: p.actualOutcome?.verifiedAt,
}));
    
        // Use Gemini to analyze patterns in historical predictions
        const analysis = await analyzeHistoricalPredictions(
          formattedPredictions.map((p) => ({
            stock: p.symbol,
            predictedOutcome: `${p.predictedDirection} at ${p.predictedPrice}`,
            actualOutcome: p.actualPrice
              ? `${p.actualDirection} at ${p.actualPrice}`
              : "unknown",
          }))
        );
    
        return {
          predictions: formattedPredictions,
          marketData,
          analysis,
        };
      } catch (error) {
        console.error("Error getting relevant historical data:", error);
        throw error;
      }
}

// Generate a new prediction using Gemini and historical data
export async function generateAIPrediction(
  symbol: string,
  userQuery: string
): Promise<{
  symbol: string;
  currentPrice: number;
  predictedPrice: number;
  predictedDirection: "up" | "down" | "neutral";
  confidence: number;
  timeframe: string;
  analysis: string;
  technicalFactors: string[];
  fundamentalFactors: string[];
  marketConditions: string[];
  historicalAccuracy: number;
}> {
  try {
    const stockData = await findOne("stockQuotes", { symbol: symbol.toUpperCase() });

    if (!stockData) {
      console.error(`No data available for symbol: ${symbol}`);
    }

    const historicalData = await getRelevantHistoricalData(symbol);

    const formattedHistoricalChats = historicalData.predictions.map((prediction) => ({
      userMessage: `Predict the stock ${prediction.symbol} with initial price ${prediction.initialPrice} and timeframe ${prediction.timeframe}.`,
      aiResponse: `Predicted ${prediction.predictedDirection} with price target ${prediction.predictedPrice}.`,
      accuracy: prediction.accuracy,
    }));

    const prompt = `
You are a stock market analysis assistant. Analyze the stock symbol **${symbol.toUpperCase()}** and provide a detailed prediction using the following structure in **Markdown format** in points and sentences with **bold** and *italics* where appropriate.:

### 📈 Stock Prediction Summary
- **Predicted Direction:** (Up / Down / Neutral)
- **Price Target:** $X.XX
- **Confidence Level:** X%
- **Timeframe:** (e.g., 1 week / 1 month)

---

### 📊 Technical Factors
- Bullet points listing key technical indicators or price movements.

### 💼 Fundamental Factors
- Bullet points explaining any recent news, earnings, or company data impacting the stock.

### 🌐 Market Conditions
- Bullet points about overall market trends, sector movement, or macroeconomic data affecting the stock.

---

### 📋 Analysis Summary
Provide a short 3–5 sentence explanation of your prediction using the above points.

---

### ⚠️ Disclaimer
Investing in the stock market involves risks. This analysis is not financial advice. Always do your own research.

User query: ${userQuery}
`;

    const analysisRaw = await generateStockAnalysis(prompt, stockData || undefined, formattedHistoricalChats);

    // Clean and structure Markdown response
    const formattedAnalysis = analysisRaw
      .replace(/\r\n/g, "\n")                        // Normalize line endings
      .replace(/ {2,}/g, " ")                        // Remove extra spaces
      .replace(/\n{3,}/g, "\n\n")                    // No more than 2 line breaks
      .replace(/([^\n])\n(?!\n)/g, "$1  \n")         // Single newlines to Markdown line breaks
      .replace(/#+ /g, (match) => `\n\n${match}`)    // Ensure headers start on new lines
      .replace(/- /g, "\n- ")                        // Ensure bullet points are on new lines
      .trim();

    const lowerAnalysis = formattedAnalysis.toLowerCase();

    const predictedDirection =
      lowerAnalysis.includes("bullish") || lowerAnalysis.includes("upward") || lowerAnalysis.includes("up")
        ? "up"
        : lowerAnalysis.includes("bearish") || lowerAnalysis.includes("downward") || lowerAnalysis.includes("down")
        ? "down"
        : "neutral";

    const confidenceMatch = formattedAnalysis.match(/confidence(?: level)?:?\s*(\d+)%/i);
    const confidence = confidenceMatch ? Number.parseInt(confidenceMatch[1]) / 100 : 0.7;

    const priceTargetMatch = formattedAnalysis.match(/price target:?\s*\$?(\d+\.?\d*)/i);
    const predictedPrice = priceTargetMatch
      ? Number.parseFloat(priceTargetMatch[1])
      : predictedDirection === "up"
      ? (stockData?.price ?? 0) * 1.05
      : predictedDirection === "down"
      ? (stockData?.price ?? 0) * 0.95
      : stockData?.price ?? 0;

    const technicalFactors = extractFactors(formattedAnalysis, "technical");
    const fundamentalFactors = extractFactors(formattedAnalysis, "fundamental");
    const marketConditions = extractFactors(formattedAnalysis, "market");

    return {
      symbol: symbol.toUpperCase(),
      currentPrice: stockData?.price ?? 0,
      predictedPrice,
      predictedDirection,
      confidence,
      timeframe: "1 month",
      analysis: formattedAnalysis,
      technicalFactors,
      fundamentalFactors,
      marketConditions,
      historicalAccuracy: calculateHistoricalAccuracy(historicalData.predictions),
    };
  } catch (error) {
    console.error("Error generating AI prediction:", error);
    throw error;
  }
}


// Helper function to calculate historical prediction accuracy
function calculateHistoricalAccuracy(predictions: { accuracy?: number }[]): number {
  if (!predictions || predictions.length === 0) {
    return 0;
  }

  const predictionsWithOutcomes = predictions.filter((p) => p.accuracy !== undefined);
  if (predictionsWithOutcomes.length === 0) {
    return 0;
  }

  const totalAccuracy = predictionsWithOutcomes.reduce((sum, p) => sum + (p.accuracy ?? 0), 0);
  return totalAccuracy / predictionsWithOutcomes.length;
}

// Helper function to extract factors from analysis text
function extractFactors(analysis: string, type: string): string[] {
  const factors: string[] = []

  // Look for sections that might contain factors of the specified type
  const regex = new RegExp(`${type}\\s+factors?:?([^\\n]+(?:\\n(?!\\n|[A-Z]).+)*)`, "i")
  const match = analysis.match(regex)

  if (match && match[1]) {
    // Split by bullet points, numbers, or other common separators
    const factorText = match[1].trim()
    const factorItems = factorText.split(/(?:\r?\n|\s*[-•*]\s*|\s*\d+\.\s*)/g)

    // Filter out empty items and add non-empty ones
    factorItems.forEach((item) => {
      const trimmed = item.trim()
      if (trimmed && trimmed.length > 3) {
        factors.push(trimmed)
      }
    })
  }

  // If no structured factors found, try to extract sentences containing keywords
  if (factors.length === 0) {
    const keywords = getKeywordsByType(type)
    const sentences = analysis.split(/[.!?]+/)

    sentences.forEach((sentence) => {
      const trimmed = sentence.trim()
      if (trimmed && keywords.some((keyword) => trimmed.toLowerCase().includes(keyword))) {
        factors.push(trimmed)
      }
    })
  }

  return factors.slice(0, 5) // Limit to top 5 factors
}

// Helper function to get keywords by factor type
function getKeywordsByType(type: string): string[] {
  switch (type.toLowerCase()) {
    case "technical":
      return ["moving average", "resistance", "support", "rsi", "macd", "volume", "trend", "chart", "pattern"]
    case "fundamental":
      return ["earnings", "revenue", "profit", "eps", "p/e", "valuation", "dividend", "growth", "margin"]
    case "market":
      return ["market", "sector", "industry", "economy", "fed", "interest rate", "inflation", "sentiment"]
    default:
      return []
  }
}

// Helper function to calculate historical prediction accuracy
