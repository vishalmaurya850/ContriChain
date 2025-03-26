"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown, Search, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface StockData {
  symbol: string
  price: number
  change: number
  changePercent: number
  prediction?: {
    direction: "up" | "down" | "neutral"
    confidence: number
    target: number
    timeframe: string
  }
}

export function StockMarketDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [stocks, setStocks] = useState<StockData[]>([])
  const { toast } = useToast()

 // Memoize fetchDefaultStocks to avoid re-creating it on every render
 const fetchDefaultStocks = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/stocks/trending")
      if (!response.ok) {
        throw new Error("Failed to fetch trending stocks")
      }
      const data = await response.json()
      setStocks(data)
    } catch (error) {
      console.error("Error fetching stocks:", error)
      toast({
        title: "Error",
        description: "Failed to fetch stock data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Load initial stock data
  useEffect(() => {
    fetchDefaultStocks()
  }, [fetchDefaultStocks])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim() || isLoading) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/stocks/search?symbol=${searchQuery.toUpperCase()}`)
      if (!response.ok) {
        throw new Error("Failed to fetch stock data")
      }
      const data = await response.json()

      // Add to the beginning of the list
      setStocks((prev) => {
        // Remove if already exists
        const filtered = prev.filter((stock) => stock.symbol !== data.symbol)
        return [data, ...filtered].slice(0, 5) // Keep only top 5
      })

      setSearchQuery("")
    } catch (error) {
      console.error("Error searching stock:", error)
      toast({
        title: "Error",
        description: "Failed to find the stock. Please check the symbol and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getPredictionColor = (direction: string) => {
    switch (direction) {
      case "up":
        return "text-green-500"
      case "down":
        return "text-red-500"
      default:
        return "text-yellow-500"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Stock Market
        </CardTitle>
        <CardDescription>Real-time data and AI predictions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Enter stock symbol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isLoading}
            className="flex-grow"
          />
          <Button type="submit" size="icon" disabled={isLoading || !searchQuery.trim()}>
            <Search className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>
        </form>

        <div className="space-y-3">
          {isLoading ? (
            Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-10 w-full" />
                </div>
              ))
          ) : stocks.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No stocks to display</p>
          ) : (
            stocks.map((stock) => (
              <div key={stock.symbol} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{stock.symbol}</div>
                    <div className="text-2xl font-bold">${stock.price.toFixed(2)}</div>
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center ${stock.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {stock.change >= 0 ? (
                        <TrendingUp className="mr-1 h-4 w-4" />
                      ) : (
                        <TrendingDown className="mr-1 h-4 w-4" />
                      )}
                      {stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                    </div>
                    {stock.prediction && (
                      <div className={`text-sm mt-1 ${getPredictionColor(stock.prediction.direction)}`}>
                        Prediction:{" "}
                        {stock.prediction.direction === "up" ? "↑" : stock.prediction.direction === "down" ? "↓" : "→"}$
                        {stock.prediction.target.toFixed(2)} ({stock.prediction.timeframe})
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <Button variant="outline" size="sm" className="w-full" onClick={fetchDefaultStocks} disabled={isLoading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Data
        </Button>
      </CardContent>
    </Card>
  )
}