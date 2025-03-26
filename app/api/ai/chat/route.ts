import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { z } from "zod"

// Schema for chat request
const chatSchema = z.object({
  message: z.string().min(1),
  category: z.enum(["funding", "stocks"]),
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { message, category } = chatSchema.parse(body)

    // For development or if Vertex AI credentials are not set up
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Return mock responses based on category
      if (category === "funding") {
        return NextResponse.json({
          response: generateMockFundingResponse(message),
        })
      } else {
        return NextResponse.json({
          response: generateMockStockResponse(message),
        })
      }
    }

    // If you have Vertex AI set up, you would use it here
    // For now, we'll use the mock responses
    if (category === "funding") {
      return NextResponse.json({
        response: generateMockFundingResponse(message),
      })
    } else {
      return NextResponse.json({
        response: generateMockStockResponse(message),
      })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
    }

    console.error("Error generating AI response:", error)
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
  }
}

// Mock response generators for development
function generateMockFundingResponse(message: string): string {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes("crowdfunding")) {
    return "Crowdfunding is an excellent way to raise capital for your project. I recommend focusing on these key elements: 1) Create a compelling story that resonates with potential backers, 2) Set realistic funding goals, 3) Offer attractive rewards, 4) Build a community before launching, and 5) Maintain regular communication with your backers. Would you like more specific advice on any of these aspects?"
  } else if (lowerMessage.includes("invest") || lowerMessage.includes("roi")) {
    return "When considering investments for your portfolio, it's important to diversify across different asset classes. For crowdfunding investments specifically, look for projects with clear business models, experienced teams, and realistic valuation. Remember that these investments typically carry higher risk but potentially higher returns. I'd recommend allocating no more than 5-10% of your portfolio to alternative investments like crowdfunding."
  } else if (lowerMessage.includes("budget") || lowerMessage.includes("plan")) {
    return "Creating a solid financial plan for your project is crucial. Start by estimating all potential costs including development, marketing, operations, and a contingency buffer of at least 20%. Then, determine your funding sources - will you use personal savings, seek investors, or use crowdfunding? For crowdfunding specifically, remember to account for platform fees (typically 5-10%) and the cost of fulfilling rewards in your budget."
  } else {
    return "Thank you for your question about funding. To provide the most helpful advice, could you share more details about your specific project or financial goals? I can offer guidance on crowdfunding strategies, investment opportunities, financial planning, or budget optimization based on your needs."
  }
}

function generateMockStockResponse(message: string): string {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes("apple") || lowerMessage.includes("aapl")) {
    return "Based on my analysis, Apple (AAPL) shows strong fundamentals with consistent revenue growth and a solid balance sheet. Technical indicators suggest a bullish trend in the medium term, with potential resistance at $195. The company's continued innovation in services and wearables provides growth opportunities beyond its core iPhone business. For long-term investors, AAPL remains a solid holding, though short-term volatility may occur around product announcements and earnings reports."
  } else if (lowerMessage.includes("tesla") || lowerMessage.includes("tsla")) {
    return "Tesla (TSLA) presents a mixed outlook currently. While the company maintains leadership in the EV market, increasing competition and margin pressures are concerns. Technical analysis shows the stock in a consolidation phase with key support at $175. Future performance will likely depend on production scaling, progress in autonomous driving, and energy storage growth. Consider a measured approach if investing, perhaps using dollar-cost averaging rather than a large single position."
  } else if (lowerMessage.includes("market") || lowerMessage.includes("trend")) {
    return "The current market trend shows cautious optimism amid economic uncertainty. Key indices are trading near all-time highs, supported by strong corporate earnings and technological innovation, particularly in AI. However, inflation concerns and potential interest rate changes could introduce volatility. Sector rotation continues, with technology and healthcare showing strength. For the next quarter, maintain a balanced portfolio with some defensive positions while watching economic indicators closely."
  } else {
    return "Thank you for your interest in stock market insights. To provide specific analysis, could you mention which stocks or market sectors you're interested in? I can offer technical analysis, fundamental evaluation, or broader market trend assessments based on your investment goals and time horizon."
  }
}