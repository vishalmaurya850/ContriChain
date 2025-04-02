import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { z } from "zod"
import { findOne, updateOne, insertOne, createObjectId } from "@/lib/mongodb-admin"
import type { ChatMessage } from "@/lib/models/types"

// Schema for chat request
const chatSchema = z.object({
  message: z.string().min(1),
  sessionId: z.string().optional(),
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { message, sessionId } = chatSchema.parse(body)

    // Create a new user message
    const userMessage: ChatMessage = {
      role: "user",
      content: message,
      timestamp: new Date(),
    }

    // Generate AI response
    const aiResponse = generateStockResponse(message)

    // Create assistant message
    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: aiResponse,
      timestamp: new Date(),
    }

    let newSessionId = sessionId

    // If sessionId is provided, update existing session
    if (sessionId) {
      const chatSession = await findOne("chatSessions", {
        _id: createObjectId(sessionId),
        userId: session.user.id,
      })

      if (!chatSession) {
        return NextResponse.json({ error: "Chat session not found" }, { status: 404 })
      }

      // Update the session with new messages
      await updateOne(
        "chatSessions",
        { _id: createObjectId(sessionId) },
        {
          $push: {
            messages: { $each: [userMessage, assistantMessage] },
          },
          $set: { updatedAt: new Date() },
        },
      )
    } else {
      // Create a new session
      // Generate a title based on the first message
      const title = generateSessionTitle(message)

      const result = await insertOne("chatSessions", {
        userId: session.user.id,
        title,
        messages: [userMessage, assistantMessage],
        createdAt: new Date(),
        updatedAt: new Date(),
        category: "stocks",
      })

      newSessionId = result.insertedId.toString()
    }

    return NextResponse.json({
      response: aiResponse,
      sessionId: newSessionId,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
    }

    console.error("Error generating AI response:", error)
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
  }
}

// Generate a session title based on the first message
function generateSessionTitle(message: string): string {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes("apple") || lowerMessage.includes("aapl")) {
    return "Apple Stock Discussion"
  } else if (lowerMessage.includes("tesla") || lowerMessage.includes("tsla")) {
    return "Tesla Stock Analysis"
  } else if (lowerMessage.includes("amazon") || lowerMessage.includes("amzn")) {
    return "Amazon Stock Inquiry"
  } else if (lowerMessage.includes("microsoft") || lowerMessage.includes("msft")) {
    return "Microsoft Stock Analysis"
  } else if (lowerMessage.includes("google") || lowerMessage.includes("alphabet") || lowerMessage.includes("googl")) {
    return "Google Stock Discussion"
  } else if (lowerMessage.includes("market") || lowerMessage.includes("trend") || lowerMessage.includes("index")) {
    return "Market Trends Analysis"
  } else if (
    lowerMessage.includes("invest") ||
    lowerMessage.includes("portfolio") ||
    lowerMessage.includes("strategy")
  ) {
    return "Investment Strategy Advice"
  } else if (lowerMessage.includes("crypto") || lowerMessage.includes("bitcoin") || lowerMessage.includes("ethereum")) {
    return "Cryptocurrency Discussion"
  } else {
    return "Stock Market Conversation"
  }
}

// Response generator for stock advice
function generateStockResponse(message: string): string {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes("apple") || lowerMessage.includes("aapl")) {
    return "Based on my analysis, Apple (AAPL) shows strong fundamentals with consistent revenue growth and a solid balance sheet. Technical indicators suggest a bullish trend in the medium term, with potential resistance at $195. The company's continued innovation in services and wearables provides growth opportunities beyond its core iPhone business. For long-term investors, AAPL remains a solid holding, though short-term volatility may occur around product announcements and earnings reports."
  } else if (lowerMessage.includes("tesla") || lowerMessage.includes("tsla")) {
    return "Tesla (TSLA) presents a mixed outlook currently. While the company maintains leadership in the EV market, increasing competition and margin pressures are concerns. Technical analysis shows the stock in a consolidation phase with key support at $175. Future performance will likely depend on production scaling, progress in autonomous driving, and energy storage growth. Consider a measured approach if investing, perhaps using dollar-cost averaging rather than a large single position."
  } else if (lowerMessage.includes("amazon") || lowerMessage.includes("amzn")) {
    return "Amazon (AMZN) continues to show strength across multiple business segments. AWS remains the leader in cloud services despite growing competition, and the e-commerce division has improved profitability. The stock has key support at $170 with resistance around $190. Recent AI initiatives and healthcare ventures provide additional growth vectors. The company's diversified revenue streams and continued innovation make it a strong consideration for growth portfolios."
  } else if (lowerMessage.includes("microsoft") || lowerMessage.includes("msft")) {
    return "Microsoft (MSFT) demonstrates robust performance driven by cloud services (Azure) and AI integration across its product suite. The company's successful transition to subscription-based models provides steady recurring revenue. Technical indicators show strong support at $390 with potential for continued upward momentum. Microsoft's deep integration in enterprise environments and strategic AI investments position it well for continued growth in the coming quarters."
  } else if (lowerMessage.includes("google") || lowerMessage.includes("alphabet") || lowerMessage.includes("googl")) {
    return "Alphabet/Google (GOOGL) shows resilience in its core advertising business while making significant strides in cloud services and AI development. The stock has been trading in a range between $140-$150, with increasing momentum. Recent Gemini AI announcements and cloud growth are positive catalysts, though regulatory challenges remain a consideration. The company's strong cash position and diverse revenue streams provide stability while funding future innovation."
  } else if (lowerMessage.includes("market") || lowerMessage.includes("trend") || lowerMessage.includes("index")) {
    return "The current market trend shows cautious optimism amid economic uncertainty. Key indices are trading near all-time highs, supported by strong corporate earnings and technological innovation, particularly in AI. However, inflation concerns and potential interest rate changes could introduce volatility. Sector rotation continues, with technology and healthcare showing strength. For the next quarter, maintain a balanced portfolio with some defensive positions while watching economic indicators closely."
  } else if (
    lowerMessage.includes("invest") ||
    lowerMessage.includes("portfolio") ||
    lowerMessage.includes("strategy")
  ) {
    return "For investment strategy in the current market environment, consider a barbell approach: maintain core positions in quality companies with strong cash flows and balance sheets, while allocating a portion to potential high-growth areas like AI, cybersecurity, and clean energy. Diversification across sectors remains important, with particular attention to companies demonstrating pricing power in an inflationary environment. For fixed income allocation, shorter duration bonds may be preferable given the interest rate outlook."
  } else if (lowerMessage.includes("crypto") || lowerMessage.includes("bitcoin") || lowerMessage.includes("ethereum")) {
    return "Cryptocurrency markets continue to show high volatility but increasing institutional adoption. Bitcoin's recent ETF approvals have provided more mainstream access, while Ethereum's technical upgrades improve its utility. Consider limiting crypto exposure to a small percentage of your overall portfolio (5-10% maximum) given the volatility. If investing in this space, focus on established cryptocurrencies rather than speculative alternatives, and consider dollar-cost averaging to manage entry risk."
  } else if (lowerMessage.includes("ai") || lowerMessage.includes("artificial intelligence")) {
    return "AI-related stocks have shown significant growth potential as companies integrate these technologies into their products and services. Leaders like NVIDIA benefit from hardware demand, while cloud providers like Microsoft, Google, and Amazon leverage AI in their platforms. Enterprise software companies implementing AI features are seeing improved customer retention and upselling opportunities. When investing in this sector, consider both pure-play AI companies and established firms successfully integrating AI. The sector may experience volatility due to high valuations, so a diversified approach across the AI value chain is advisable."
  } else {
    return "Thank you for your question about the stock market. To provide specific analysis, could you mention which stocks or market sectors you're interested in? I can offer technical analysis, fundamental evaluation, or broader market trend assessments based on your investment goals and time horizon."
  }
}