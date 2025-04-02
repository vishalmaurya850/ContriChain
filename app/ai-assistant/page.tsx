import { StockMarketDashboard } from "@/components/stock-market-dashboard"
import { StockAdvisor } from "@/components/stock-advisor"
import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Stock Advisor | CryptoFund",
  description: "Get stock market predictions and insights from our AI advisor",
}

export default async function StockAdvisorPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login?callbackUrl=/ai-assistant")
  }

  return (
    <main className="container px-4 py-12 md:px-6 md:py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-2">Stock Advisor</h1>
        <p className="text-muted-foreground">Get real-time stock market data and AI-powered predictions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <StockAdvisor />
        </div>
        <div>
          <StockMarketDashboard />
        </div>
      </div>
    </main>
  )
}