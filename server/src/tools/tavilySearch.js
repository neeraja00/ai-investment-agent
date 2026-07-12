// server/src/tools/tavilySearch.js
// Tavily web search for real-time company research

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

export async function tavilySearch(query, topic = "general") {
  if (!TAVILY_API_KEY) {
    console.warn("⚠️  TAVILY_API_KEY not set — skipping web search");
    return `[Web search unavailable — no results for: "${query}"]`;
  }

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TAVILY_API_KEY}`,
      },
      body: JSON.stringify({
        query,
        topic,
        search_depth: "advanced",
        max_results: 6,
        include_answer: true,
        include_raw_content: false,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Tavily error:", err);
      return `[Search failed with status ${res.status}]`;
    }

    const data = await res.json();
    let result = "";

    if (data.answer) result += `Key Insight: ${data.answer}\n\n`;

    if (data.results?.length > 0) {
      result += "Recent Sources:\n";
      data.results.slice(0, 5).forEach((r) => {
        result += `\n• ${r.title}\n  ${r.content?.slice(0, 350)}...\n`;
      });
    }

    return result || "No results found.";
  } catch (err) {
    console.error("Tavily search exception:", err);
    return `[Search error: ${err.message}]`;
  }
}
