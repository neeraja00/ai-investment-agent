// Built-in fetch
async function run() {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/AAPL?interval=1d&range=1mo`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const data = await res.json();
    const result = data.chart.result[0];
    const quote = result.indicators.quote[0];
    console.log("Timestamps:", result.timestamp.length);
    console.log("Volumes:", quote.volume.length);
    console.log("Last close:", quote.close[quote.close.length - 1]);
    console.log("Last volume:", quote.volume[quote.volume.length - 1]);
  } catch (e) {
    console.error("Yahoo Fetch Failed:", e);
  }
}
run();
