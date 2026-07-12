import React, { useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Download } from "lucide-react";

export default function ResearchReport({ report }) {
  const componentRef = useRef(null);
  
  const handlePrint = () => {
    window.print();
  };

  if (!report) return null;

  return (
    <div className="card" style={{ padding: "32px", position: "relative" }}>
      <button 
        onClick={handlePrint}
        className="btn btn-primary no-print" 
        style={{ position: "absolute", top: 24, right: 32, padding: "8px 16px", fontSize: "0.85rem" }}
      >
        <Download size={16} /> Export PDF
      </button>

      {/* The div we want to print */}
      <div ref={componentRef} style={{ padding: "16px" }} className="print-container">
        <h2 style={{ marginBottom: 24, borderBottom: "1px solid var(--border-subtle)", paddingBottom: 16, color: "var(--text-primary)" }}>
          AI Investment Analysis
        </h2>
        <div className="markdown-body" style={{ color: "var(--text-primary)" }}>
          <ReactMarkdown>{report}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
