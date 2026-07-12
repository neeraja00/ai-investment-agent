// client/src/hooks/useResearch.js
// Custom hook that manages SSE streaming from the server

import { useState, useCallback, useRef } from "react";

const API_URL = "/api/research";

export function useResearch() {
  const [state, setState] = useState({
    status: "idle", // idle | loading | streaming | done | error
    steps: [],
    result: null,
    error: null,
    currentLabel: "",
  });

  const abortRef = useRef(null);

  const research = useCallback(async (companyName) => {
    // Reset state
    setState({ status: "loading", steps: [], result: null, error: null, currentLabel: "Starting research..." });

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName }),
        signal: abortRef.current?.signal,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Server error");
      }

      // Read SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      setState(prev => ({ ...prev, status: "streaming" }));

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            handleEvent(event);
          } catch { /* skip malformed */ }
        }
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setState(prev => ({ ...prev, status: "error", error: err.message }));
      }
    }

    function handleEvent(event) {
      switch (event.type) {
        case "start":
          setState(prev => ({ ...prev, currentLabel: event.message }));
          break;

        case "step_start":
          setState(prev => ({
            ...prev,
            currentLabel: event.label,
            steps: upsertStep(prev.steps, { id: event.step, label: event.label, status: "running" }),
          }));
          break;

        case "step_complete":
          setState(prev => ({
            ...prev,
            currentLabel: event.label,
            steps: upsertStep(prev.steps, { id: event.step, label: event.label, status: "complete" }),
          }));
          break;

        case "step_error":
          setState(prev => ({
            ...prev,
            steps: upsertStep(prev.steps, { id: event.step, label: event.label, status: "error" }),
          }));
          break;

        case "final_result":
          setState(prev => ({
            ...prev,
            status: "done",
            result: event.result,
            currentLabel: "Research complete!",
          }));
          break;

        case "error":
          setState(prev => ({ ...prev, status: "error", error: event.message }));
          break;
      }
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState({ status: "idle", steps: [], result: null, error: null, currentLabel: "" });
  }, []);

  const setResult = useCallback((res) => {
    setState({ status: "done", steps: [], result: res, error: null, currentLabel: "Loaded from history" });
  }, []);

  return { ...state, research, reset, setResult };
}

function upsertStep(steps, newStep) {
  const idx = steps.findIndex(s => s.id === newStep.id);
  if (idx === -1) return [...steps, newStep];
  return steps.map((s, i) => i === idx ? { ...s, ...newStep } : s);
}
