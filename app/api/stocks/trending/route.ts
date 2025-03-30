import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import * as finnhub from "finnhub";

export async function GET(): Promise<Response> {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Define trending stocks to fetch
    const symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"];

    // If API key is not set, return mock data
    const apiKey = process.env.FINNHUB_API_KEY || "";
    if (!apiKey) {
      return NextResponse.json([
        {
          symbol: "AAPL",
          price: 187.68,
          change: 1.25,
          changePercent: 0.67,
          high: 188.45,
          low: 186.21,
          open: 186.5,
          prevClose: 186.43,
          prediction: {
            direction: "up",
            confidence: 0.78,
            target: 195.5,
            timeframe: "1 month",
          },
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
          prediction: {
            direction: "up",
            confidence: 0.82,
            target: 425.0,
            timeframe: "1 month",
          },
        },
        {
          symbol: "GOOGL",
          price: 142.56,
          change: -0.87,
          changePercent: -0.61,
          high: 143.45,
          low: 141.98,
          open: 143.4,
          prevClose: 143.43,
          prediction: {
            direction: "neutral",
            confidence: 0.65,
            target: 145.0,
            timeframe: "1 month",
          },
        },
        {
          symbol: "TSLA",
          price: 177.89,
          change: -2.34,
          changePercent: -1.3,
          high: 180.45,
          low: 177.21,
          open: 180.2,
          prevClose: 180.23,
          prediction: {
            direction: "down",
            confidence: 0.71,
            target: 165.0,
            timeframe: "1 month",
          },
        },
        {
          symbol: "AMZN",
          price: 178.12,
          change: 1.56,
          changePercent: 0.88,
          high: 179.45,
          low: 177.65,
          open: 177.8,
          prevClose: 176.56,
          prediction: {
            direction: "up",
            confidence: 0.75,
            target: 190.0,
            timeframe: "1 month",
          },
        },
      ]);
    }

    // Initialize Finnhub client
    const apiClient = finnhub.ApiClient.instance;
    apiClient.authentications['api_key'].apiKey = apiKey;
    const finnhubClient = new finnhub.DefaultApi();

    // Fetch data for each symbol using Promise.all for parallel requests
    const promises = symbols.map((symbol) => {
      return new Promise<{
        symbol: string;
        price: number;
        change: number;
        changePercent: number;
        high: number;
        low: number;
        open: number;
        prevClose: number;
        prediction: {
          direction: string;
          confidence: number;
          target: number;
          timeframe: string;
        };
      }>((resolve, reject) => {
        finnhubClient.quote(symbol, (error, data, response) => {
          if (error) {
            reject(error);
            return;
          }
          if (response.statusCode !== 200) {
            reject(new Error(`Finnhub API error: ${response.statusCode}`));
            return;
          }
          // Generate AI prediction (this would come from a real AI model in production)
          const direction = data.dp > 0 ? "up" : data.dp < 0 ? "down" : "neutral";
          const confidence = 0.6 + Math.random() * 0.3;
          const targetMultiplier =
            direction === "up"
              ? 1 + Math.random() * 0.1
              : direction === "down"
              ? 0.9 + Math.random() * 0.1
              : 0.95 + Math.random() * 0.1;

          resolve({
            symbol,
            price: data.c,
            change: data.d,
            changePercent: data.dp,
            high: data.h,
            low: data.l,
            open: data.o,
            prevClose: data.pc,
            prediction: {
              direction,
              confidence,
              target: Number.parseFloat((data.c * targetMultiplier).toFixed(2)),
              timeframe: "1 month",
            },
          });
        });
      });
    });

    const results = await Promise.all(promises);
    return NextResponse.json(results);
  } catch (finnhubError) {
    console.error("Finnhub API error:", finnhubError);
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 });
  }
}