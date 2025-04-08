import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai"

// Initialize the Google Generative AI client
const apiKey = process.env.GOOGLE_GEMINI_API_KEY || ""
const genAI = new GoogleGenerativeAI(apiKey)

// Configure safety settings
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
]

// Create a model instance with the experimental model
export const geminiModel = genAI.getGenerativeModel({
  model: "models/gemini-2.0-flash-thinking-exp-1219",
  safetySettings,
})

// Function to generate stock analysis and predictions
export async function generateStockAnalysis(prompt: string, stockData?: Record<string, unknown>, historicalChats?: { userMessage: string; aiResponse: string; accuracy?: number }[]) {
  try {
    // Create a system prompt that includes instructions for the model
    const systemPrompt = `You are an expert stock market analyst and financial advisor powered by Google Gemini 2.5 Pro. 
    Your task is to provide accurate, data-driven analysis and predictions about stocks, market trends, and investment strategies.
    
    When analyzing stocks:
    1. Consider both technical and fundamental factors
    2. Provide specific price targets when appropriate
    3. Discuss potential risks and opportunities
    4. Base your analysis on factual market data
    5. Avoid making guarantees about future performance
    6. Always include appropriate disclaimers about investment risks
    
    Current date: ${new Date().toISOString().split("T")[0]}`

    // Include historical stock data if available
    let fullPrompt = systemPrompt + "\n\nUser query: " + prompt

    if (stockData) {
      fullPrompt += "\n\nCurrent stock data: " + JSON.stringify(stockData)
    }

    // Include relevant historical chat data for context and learning
    if (historicalChats && historicalChats.length > 0) {
      const relevantChats = historicalChats.slice(0, 5) // Limit to most recent 5 relevant chats
      fullPrompt +=
        "\n\nRelevant historical conversations to learn from:\n" +
        relevantChats
          .map(
            (chat) =>
              `User: ${chat.userMessage}\nYour previous response: ${chat.aiResponse}\n` +
              (chat.accuracy ? `Prediction accuracy: ${chat.accuracy}%` : ""),
          )
          .join("\n\n")
    }

    // Generate content with the model
    const result = await geminiModel.generateContent(fullPrompt)
    const response = await result.response
    const text = response.text()

    return text
  } catch (error) {
    console.error("Error generating stock analysis with Gemini:", error)
    throw error
  }
}

// Function to analyze historical predictions and improve future ones
export async function analyzeHistoricalPredictions(predictions: { stock: string; predictedOutcome: string; actualOutcome: string }[]) {
  try {
    const prompt = `As an AI financial analyst, review these historical stock predictions and their actual outcomes:
  
  ${JSON.stringify(predictions)}
  
  Analyze patterns in successful and unsuccessful predictions. What factors led to accurate predictions? 
  What were common mistakes in inaccurate predictions? Provide specific insights on how to improve future predictions.
  Format your response as structured JSON with these keys:
  1. "patterns": Array of identified patterns
  2. "successFactors": Factors that contributed to accurate predictions
  3. "improvementAreas": Areas where predictions could be improved
  4. "recommendedApproach": Suggested methodology for future predictions
  
  Important: Return ONLY the JSON object without any markdown formatting, code blocks, or additional text.`

    const result = await geminiModel.generateContent(prompt)
    const response = await result.response
    const analysisText = response.text()

    // Parse the JSON response with improved error handling
    try {
      // Check if the response is wrapped in markdown code blocks and extract just the JSON
      let jsonText = analysisText

      // Remove markdown code blocks if present
      const jsonMatch = analysisText.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
      if (jsonMatch && jsonMatch[1]) {
        jsonText = jsonMatch[1]
      }

      return JSON.parse(jsonText)
    } catch (e) {
      console.error("Failed to parse Gemini analysis response as JSON:", e)
      // Return a structured fallback object instead of raw text
      return {
        patterns: ["Unable to parse AI response"],
        successFactors: ["Technical analysis alignment", "Market trend following"],
        improvementAreas: ["Response formatting", "Data processing"],
        recommendedApproach: "Continue with technical and fundamental analysis while improving data processing",
        rawAnalysis: analysisText,
      }
    }
  } catch (error) {
    console.error("Error analyzing historical predictions:", error)
    throw error
  }
}