import { StockMarketDashboard } from "@/components/stock-market-dashboard"
import { StockAdvisor } from "@/components/stock-advisor"
import { MarketOverview } from "@/components/market-overview"
import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Stock Advisor | CryptoFund",
  description: "Get stock market predictions and insights from our AI advisor powered by Google Gemini 2.5 Pro",
}

export default async function StockAdvisorPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login?callbackUrl=/ai-assistant")
  }

  return (
    <main className="container px-4 py-6 md:px-6 md:py-8">
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tighter sm:text-4xl mb-2">Stock Advisor</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Get real-time stock market data and AI-powered predictions with Google Gemini 2.5 Pro
        </p>
      </div>

      {/* Main content area with responsive layout */}
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Stock Advisor takes full width on all screens */}
        <div className="w-full">
          <StockAdvisor />
        </div>

        {/* Market data in a responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          <div className="w-full">
            <StockMarketDashboard />
          </div>
          <div className="w-full">
            <MarketOverview />
          </div>
        </div>
      </div>
    </main>
  )
}