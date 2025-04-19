import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/data/supabase";

// List of 77 tickers to track
const tickers = [
  "AAPL",
  "TSLA",
  "AMZN",
  "MSFT",
  "NVDA",
  "GOOGL",
  "META",
  "NFLX",
  "JPM",
  "V",
  "BAC",
  "AMD",
  "PYPL",
  "DIS",
  "T",
  "PFE",
  "COST",
  "INTC",
  "KO",
  "TGT",
  "NKE",
  "SPY",
  "BA",
  "BABA",
  "XOM",
  "WMT",
  "GE",
  "CSCO",
  "VZ",
  "JNJ",
  "CVX",
  "PLTR",
  "SQ",
  "SHOP",
  "SBUX",
  "SOFI",
  "HOOD",
  "RBLX",
  "SNAP",
  "UBER",
  "FDX",
  "ABBV",
  "ETSY",
  "MRNA",
  "LMT",
  "GM",
  "F",
  "RIVN",
  "LCID",
  "CCL",
  "DAL",
  "UAL",
  "AAL",
  "TSM",
  "SONY",
  "ET",
  "NOK",
  "MRO",
  "COIN",
  "RIOT",
  "CPRX",
  "VWO",
  "SPYG",
  "ROKU",
  "ATVI",
  "BIDU",
  "DOCU",
  "ZM",
  "PINS",
  "TLRY",
  "WBA",
  "MGM",
  "NIO",
  "C",
  "GS",
  "WFC",
];

// Remove duplicates from the list
const uniqueTickers = [...new Set(tickers)];

async function fetchStockData(ticker: string) {
  try {
    const today = new Date();
    const from = new Date();
    today.setDate(today.getDate() - 1);
    from.setDate(today.getDate() - 1); // Get last day of data

    console.log(`Fetching data for ${ticker} from ${from} to ${today}`);

    const fromStr = from.toISOString().split("T")[0];
    const toStr = today.toISOString().split("T")[0];

    const response = await fetch(
      `https://financialmodelingprep.com/stable/historical-price-eod/full?symbol=${ticker}&from=${fromStr}&to=${toStr}&apikey=${process.env.FMP_API_KEY}`,
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    console.log(`Received data for ${ticker} from ${from} to ${today}.`);

    const data = await response.json();

    console.log(`Received ${data.length} records for ${ticker}`);

    return data;
  } catch (error) {
    console.error(`Error fetching data for ${ticker}:`, error);
    return [];
  }
}

interface StockDataItem {
  symbol: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change: number;
  changePercent: number;
  vwap: number;
}

async function storeInSupabase(stockData: StockDataItem[]) {
  if (!stockData || stockData.length === 0) return;

  console.log(`Storing ${stockData.length} records in Supabase`);

  const formattedData = stockData.map((item) => ({
    symbol: item.symbol,
    date: item.date,
    open: item.open,
    high: item.high,
    low: item.low,
    close: item.close,
    volume: item.volume,
    change: item.change,
    change_percent: item.changePercent,
    vwap: item.vwap,
  }));

  const { error } = await supabaseAdmin
    .from("stock_eod_data")
    .upsert(formattedData, { onConflict: "symbol,date" });

  if (error) {
    console.error("Error storing data in Supabase:", error);
  }
}

export async function GET(request: Request) {
  // Check for secret to confirm this is a valid request
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("Received request to fetch stock data");

  try {
    // Process tickers in batches to avoid overwhelming the API
    const batchSize = 5;
    for (let i = 0; i < uniqueTickers.length; i += batchSize) {
      const batch = uniqueTickers.slice(i, i + batchSize);

      console.log(
        `Processing batch ${i / batchSize + 1} of ${Math.ceil(
          uniqueTickers.length / batchSize,
        )}`,
      );

      const promises = batch.map(fetchStockData);
      const results = await Promise.all(promises);

      console.log(
        `Processed batch ${i / batchSize + 1} of ${Math.ceil(
          uniqueTickers.length / batchSize,
        )}`,
      );

      // Store each result in Supabase
      for (const data of results) {
        await storeInSupabase(data);
      }

      console.log(
        `Stored batch ${i / batchSize + 1} of ${Math.ceil(
          uniqueTickers.length / batchSize,
        )}`,
      );

      // Add a small delay between batches to avoid rate limits
      if (i + batchSize < uniqueTickers.length) {
        console.log("Waiting 0.1 seconds before next batch");
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return NextResponse.json({
      message: "Stock data fetched and stored successfully",
      tickersProcessed: uniqueTickers.length,
    });
  } catch (error) {
    console.error("Error in handler:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
