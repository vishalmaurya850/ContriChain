"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react"

interface MarketData {
  date: string
  indicators: {
    vix: number
    fedRate: number
    unemployment: number
    gdp: number
    inflation: number
  }
  majorIndices: {
    [index: string]: {
      value: number
      change: number
      changePercent: number
    }
  }
  sectorPerformance: {
    [sector: string]: {
      change: number
      changePercent: number
    }
  }
}

export function MarketOverview() {
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch("/api/stocks/market-data")
        if (!response.ok) {
          throw new Error("Failed to fetch market data")
        }
        const data = await response.json()
        setMarketData(data)
      } catch (error) {
        console.error("Error fetching market data:", error)
        toast({
          title: "Error",
          description: "Failed to load market data. Using simulated data instead.",
          variant: "destructive",
        })
        // Use simulated data as fallback
        setMarketData({
          date: new Date().toISOString(),
          indicators: {
            vix: 18.5,
            fedRate: 5.25,
            unemployment: 3.8,
            gdp: 2.5,
            inflation: 3.2,
          },
          majorIndices: {
            "S&P 500": {
              value: 5120.45,
              change: 23.45,
              changePercent: 0.46,
            },
            "Dow Jones": {
              value: 38765.32,
              change: 156.78,
              changePercent: 0.41,
            },
            Nasdaq: {
              value: 16234.56,
              change: -45.67,
              changePercent: -0.28,
            },
          },
          sectorPerformance: {
            Technology: {
              change: 1.2,
              changePercent: 1.2,
            },
            Healthcare: {
              change: -0.5,
              changePercent: -0.5,
            },
            Financials: {
              change: 0.8,
              changePercent: 0.8,
            },
            "Consumer Discretionary": {
              change: -0.3,
              changePercent: -0.3,
            },
            Energy: {
              change: 1.5,
              changePercent: 1.5,
            },
          },
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchMarketData()
  }, [toast])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Market Overview
        </CardTitle>
        <CardDescription>Data as of {new Date(marketData?.date || "").toLocaleDateString()}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="indices">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="indices">Major Indices</TabsTrigger>
            <TabsTrigger value="sectors">Sectors</TabsTrigger>
            <TabsTrigger value="indicators">Indicators</TabsTrigger>
          </TabsList>

          <TabsContent value="indices" className="pt-4">
            <div className="space-y-2">
              {marketData &&
                Object.entries(marketData.majorIndices).map(([name, data]) => (
                  <div key={name} className="flex justify-between items-center p-2 border-b">
                    <div>
                      <div className="font-medium">{name}</div>
                      <div className="text-lg font-bold">
                        {data.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className={`flex items-center ${data.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {data.change >= 0 ? (
                        <TrendingUp className="mr-1 h-4 w-4" />
                      ) : (
                        <TrendingDown className="mr-1 h-4 w-4" />
                      )}
                      <div>
                        <div>{data.change.toFixed(2)}</div>
                        <div>({data.changePercent.toFixed(2)}%)</div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="sectors" className="pt-4">
            <div className="space-y-2">
              {marketData &&
                Object.entries(marketData.sectorPerformance).map(([name, data]) => (
                  <div key={name} className="flex justify-between items-center p-2 border-b">
                    <div className="font-medium">{name}</div>
                    <div className={`flex items-center ${data.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {data.change >= 0 ? (
                        <TrendingUp className="mr-1 h-4 w-4" />
                      ) : (
                        <TrendingDown className="mr-1 h-4 w-4" />
                      )}
                      <div>{data.changePercent.toFixed(2)}%</div>
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="indicators" className="pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border rounded-md">
                <div className="text-sm text-muted-foreground">VIX</div>
                <div className="text-xl font-bold">{marketData?.indicators.vix.toFixed(2)}</div>
              </div>
              <div className="p-3 border rounded-md">
                <div className="text-sm text-muted-foreground">Fed Rate</div>
                <div className="text-xl font-bold">{marketData?.indicators.fedRate.toFixed(2)}%</div>
              </div>
              <div className="p-3 border rounded-md">
                <div className="text-sm text-muted-foreground">Unemployment</div>
                <div className="text-xl font-bold">{marketData?.indicators.unemployment.toFixed(1)}%</div>
              </div>
              <div className="p-3 border rounded-md">
                <div className="text-sm text-muted-foreground">GDP Growth</div>
                <div className="text-xl font-bold">{marketData?.indicators.gdp.toFixed(1)}%</div>
              </div>
              <div className="p-3 border rounded-md">
                <div className="text-sm text-muted-foreground">Inflation</div>
                <div className="text-xl font-bold">{marketData?.indicators.inflation.toFixed(1)}%</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}