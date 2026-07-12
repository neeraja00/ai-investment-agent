// Built-in fetch
import dotenv from "dotenv";
dotenv.config();

const FINNHUB_KEY = process.env.FINNHUB_API_KEY;

async function run() {
  const to = Math.floor(Date.now() / 1000);
  const from = to - (30 * 24 * 60 * 60);
  let url = `https://finnhub.io/api/v1/stock/candle?symbol=AAPL&resolution=D&from=${from}&to=${to}&token=${FINNHUB_KEY}`;
  let res = await fetch(url);
  console.log("Resolution D:", await res.json());
  
  url = `https://finnhub.io/api/v1/stock/candle?symbol=AAPL&resolution=W&from=${from}&to=${to}&token=${FINNHUB_KEY}`;
  res = await fetch(url);
  console.log("Resolution W:", await res.json());
}

run();
