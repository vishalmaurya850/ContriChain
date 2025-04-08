import { insertOne } from "@/lib/mongodb-admin";
import fetch from "node-fetch";

async function populateStockQuotes(symbols: string[]) {
  const apiKey = process.env.FINNHUB_API_KEY;

  if (!apiKey) {
    console.error("FINNHUB_API_KEY is not set in the environment variables.");
    return;
  }

  for (const symbol of symbols) {
    try {
      const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`);
      const data = await response.json();

      if (data.c) {
        await insertOne("stockQuotes", {
          symbol: symbol.toUpperCase(),
          price: data.c,
          change: data.d,
          changePercent: data.dp,
          high: data.h,
          low: data.l,
          open: data.o,
          prevClose: data.pc,
          updatedAt: new Date(),
        });
        console.log(`Inserted data for symbol: ${symbol}`);
      } else {
        console.warn(`No data available for symbol: ${symbol}`);
      }
    } catch (error) {
      console.error(`Error fetching data for symbol: ${symbol}`, error);
    }
  }
}

// List of stock symbols to populate
const symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NFLX", "META", "NVDA", "BABA", "INTC"];

// Run the script
populateStockQuotes(symbols).then(() => {
  console.log("Stock quotes population completed.");
  process.exit(0); // Exit the script
});