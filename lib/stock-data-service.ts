import { findOne, insertOne } from "@/lib/mongodb-admin"
import * as finnhub from "finnhub"

// Initialize Finnhub client
const apiKey = process.env.FINNHUB_API_KEY || ""
let finnhubClient: finnhub.DefaultApi | null = null

if (apiKey) {
  finnhubClient = new finnhub.DefaultApi()
  const apiClient = finnhub.ApiClient.instance
  apiClient.authentications["api_key"].apiKey = apiKey
}

// Get stock quote data with database caching
export async function getStockQuote(symbol: string): Promise<{
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
  timestamp: Date;
} | undefined> {
  try {
    // Try to get from database first
    const cachedQuote = await findOne("stockQuotes", {
      symbol: symbol.toUpperCase(),
      timestamp: { $gt: new Date(Date.now() - 15 * 60 * 1000) }, // Cache for 15 minutes
    })

    if (cachedQuote) {
      console.log(`Using cached data for ${symbol}`)
      return {
        symbol: cachedQuote.symbol,
        price: cachedQuote.price,
        change: cachedQuote.change,
        changePercent: cachedQuote.changePercent,
        high: cachedQuote.high,
        low: cachedQuote.low,
        open: cachedQuote.open,
        prevClose: cachedQuote.prevClose,
        timestamp: cachedQuote.timestamp,
      }
    }

    // If not in database or expired, fetch from Finnhub
    console.log(`Fetching fresh data for ${symbol} from Finnhub`)
    const quoteData = await fetchQuoteFromFinnhub(symbol);

    // Store in database for future use
        await insertOne("stockQuotes", {
          ...quoteData,
          timestamp: new Date(),
        });
    
        return {
          ...quoteData,
          timestamp: new Date(),
        };
      } catch (error) {
        console.error(`Error fetching stock quote for ${symbol}:`, error);
        throw error;
      }
    }
export async function getTrendingStocks(): Promise<
  {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    high: number;
    low: number;
    open: number;
    prevClose: number;
    timestamp: Date;
  }[]
> {
  try {
    const symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"];
    const results = [];

    for (const symbol of symbols) {
      try {
        const quote = await getStockQuote(symbol);
        if (quote) {
          results.push(quote);
        }
      } catch (symbolError) {
        console.error(`Error fetching ${symbol}:`, symbolError);
      }
    }

    return results;
  } catch (error) {
    console.error("Error getting trending stocks:", error);
    throw error;
  }
}

// Get trending stocks with database caching
// Removed duplicate implementation of fetchQuoteFromFinnhub

// Fetch quote directly from Finnhub
export async function fetchQuoteFromFinnhub(symbol: string): Promise<{
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
}> {
  // If API key is not set, return mock data
  if (!apiKey || !finnhubClient) {
    return generateMockQuote(symbol);
  }

  return new Promise((resolve, reject) => {
    finnhubClient!.quote(symbol.toUpperCase(), (error, data) => {
      if (error) {
        console.error(`Finnhub API error for ${symbol}:`, error)
        // Fall back to mock data if API fails
        resolve(generateMockQuote(symbol))
        return
      }

      if (!data || typeof data.c !== "number") {
        reject(new Error(`Invalid data received for ${symbol}`))
        return
      }

      resolve({
        symbol: symbol.toUpperCase(),
        price: data.c,
        change: data.d,
        changePercent: data.dp,
        high: data.h,
        low: data.l,
        open: data.o,
        prevClose: data.pc,
      })
    })
  })
}
// Removed duplicate implementation of generateMockQuote

// Generate mock quote data for development or when API fails
function generateMockQuote(symbol: string): {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
} {
  const basePrice = getBasePrice(symbol)
  const change = Math.random() * 6 - 3
  const price = basePrice + change

  return {
    symbol: symbol.toUpperCase(),
    price: price,
    change: change,
    changePercent: (change / basePrice) * 100,
    high: price + Math.random() * 2,
    low: price - Math.random() * 2,
    open: price - change / 2,
    prevClose: price - change,
  }
}

// Get a consistent base price for a symbol
function getBasePrice(symbol: string): number {
  const symbolMap: Record<string, number> = {
    AAPL: 187.68,
    MSFT: 403.78,
    GOOGL: 142.56,
    AMZN: 178.12,
    TSLA: 177.89,
    META: 472.22,
    NVDA: 879.35,
    NFLX: 624.46,
  }

  const upperSymbol = symbol.toUpperCase()

  if (symbolMap[upperSymbol]) {
    return symbolMap[upperSymbol]
  }

  // Generate a consistent price based on the symbol string
  let baseValue = 0
  for (let i = 0; i < upperSymbol.length; i++) {
    baseValue += upperSymbol.charCodeAt(i)
  }

  return 50 + (baseValue % 450)
}