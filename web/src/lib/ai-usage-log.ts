import "server-only";
import { after } from "next/server";
import { aiCostMicros } from "./ai-cost";
import { getStore } from "./store";

/** Saves the tokens and cost of one AI call for the owner dashboard. Never blocks or fails the request. */
export function logAiUsage(model: string, purpose: string, usage: { input_tokens: number; output_tokens: number } | undefined) {
  if (!usage || process.env.AI_USAGE_LOG === "0") return;
  const save = () =>
    getStore()
      .addAiUsage({
        model,
        purpose,
        inputTokens: usage.input_tokens,
        outputTokens: usage.output_tokens,
        costMicros: aiCostMicros(model, usage.input_tokens, usage.output_tokens),
        createdAt: new Date().toISOString(),
      })
      .catch((err) => console.error("ai usage log failed", err));
  try {
    after(save); // after the response is sent
  } catch {
    void save(); // outside a request (scripts)
  }
}
