import { ExternalLink } from "lucide-react";

export default function NewsFeed({ newsArticles }) {
  if (!newsArticles || newsArticles.length === 0) return null;

  const FALLBACK_IMAGES = [
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1642543348745-03b1219733d9?auto=format&fit=crop&w=500&q=80"
  ];

  return (
    <div style={{ marginTop: 24 }}>
      <h3 style={{ marginBottom: 16 }}>Latest News & Analysis</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {newsArticles.map((article, i) => {
          const imageSrc = (!article.image || article.image.includes("yimg.com") || article.image.includes("yahoo"))
            ? FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]
            : article.image;

          return (
            <a key={i} href={article.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
              <div className="card" style={{ padding: 16, height: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ height: 140, borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                  <img src={imageSrc} alt="news" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: "0.95rem", marginBottom: 8, color: "var(--text-primary)", lineHeight: 1.4 }}>
                    {article.headline}
                  </h4>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {article.summary}
                  </p>
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--accent-blue)", display: "flex", alignItems: "center", gap: 4 }}>
                  Read more <ExternalLink size={12} />
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
