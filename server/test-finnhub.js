// Using built-in fetch
const FINNHUB_KEY = process.env.FINNHUB_API_KEY || "dummy";

async function test(ticker) {
  const url = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${FINNHUB_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  console.log("Quote for", ticker, ":", data);
}

test("AAPL");
test("INFY.NS");
test("INFY");
