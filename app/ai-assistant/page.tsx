import { AIAssistant } from "@/components/ai-assistant"
import { StockMarketDashboard } from "@/components/stock-market-dashboard"
import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "AI Assistant | CryptoFund",
  description: "Get funding advice and stock market predictions from our AI assistant",
}

export default async function AIAssistantPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login?callbackUrl=/ai-assistant")
  }

  return (
    <main className="container px-4 py-12 md:px-6 md:py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-2">AI Assistant</h1>
        <p className="text-muted-foreground">Get funding advice and stock market predictions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AIAssistant />
        </div>
        <div>
          <StockMarketDashboard />
        </div>
      </div>
    </main>
  )
}