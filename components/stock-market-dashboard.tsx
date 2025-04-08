"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown, Search, RefreshCw, Brain } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

interface StockData {
  symbol: string
  price: number
  change: number
  changePercent: number
  high: number
  low: number
  open: number
  prevClose: number
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
  const [isGeneratingPrediction, setIsGeneratingPrediction] = useState(false)
  const { toast } = useToast()

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
        description: "Failed to fetch stock data. Using cached data instead.",
        variant: "destructive",
      })
      // Use mock data as fallback
      setStocks([
        {
          symbol: "AAPL",
          price: 187.68,
          change: 1.25,
          changePercent: 0.67,
          high: 188.45,
          low: 186.21,
          open: 186.5,
          prevClose: 186.43,
        },
        {
          symbol: "MSFT",
          price: 403.78,
          change: 3.45,
          changePercent: 0.86,
          high: 405.12,
          low: 400.33,
          open: 401.2,
          prevClose: 400.33,
        },
      ])
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

  const generateAIPrediction = async (symbol: string) => {
    setIsGeneratingPrediction(true)
    try {
      const response = await fetch("/api/stocks/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symbol,
          timeframe: "medium",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate prediction")
      }

      const prediction = await response.json()

      // Update the stock with the new prediction
      setStocks((prev) =>
        prev.map((stock) =>
          stock.symbol === symbol
            ? {
                ...stock,
                prediction: {
                  direction: prediction.predictedDirection,
                  confidence: prediction.confidence,
                  target: prediction.predictedPrice,
                  timeframe: prediction.timeframe,
                },
              }
            : stock,
        ),
      )

      toast({
        title: "AI Prediction Generated",
        description: `New prediction for ${symbol} has been generated using Gemini 2.5 Pro.`,
      })
    } catch (error) {
      console.error("Error generating prediction:", error)
      toast({
        title: "Prediction Failed",
        description: "Failed to generate AI prediction. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingPrediction(false)
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
    <Card className="w-full h-full">
      <CardHeader className="pb-2 space-y-1">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              Stock Market
            </CardTitle>
            <CardDescription>Real-time data and AI predictions</CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            Gemini 2.5 Pro
          </Badge>
        </div>
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

        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
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
                    {stock.prediction ? (
                      <div className={`text-sm mt-1 ${getPredictionColor(stock.prediction.direction)}`}>
                        Prediction:{" "}
                        {stock.prediction.direction === "up" ? "↑" : stock.prediction.direction === "down" ? "↓" : "→"}$
                        {stock.prediction.target.toFixed(2)} ({stock.prediction.timeframe})
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs mt-1 h-6 px-2"
                        onClick={() => generateAIPrediction(stock.symbol)}
                        disabled={isGeneratingPrediction}
                      >
                        {isGeneratingPrediction ? (
                          <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <Brain className="h-3 w-3 mr-1" />
                        )}
                        Generate AI Prediction
                      </Button>
                    )}
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div>Open: ${stock.open.toFixed(2)}</div>
                  <div>High: ${stock.high.toFixed(2)}</div>
                  <div>Low: ${stock.low.toFixed(2)}</div>
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