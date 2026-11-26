/**
 * List prices in dollars per million tokens (Anthropic pricing page, Nov 2026).
 * Used to show the owner the real AI cost from each response's token counts.
 */
const PRICES: { match: RegExp; input: number; output: number }[] = [
  // Haiku 5.5 is priced by prompt length: up to 100k tokens / above.
  { match: /^claude-haiku-5-5/, input: 0.1, output: 0.5 },
  { match: /^claude-sonnet-5/, input: 2, output: 10 },
  { match: /^claude-opus-5/, input: 4, output: 20 },
  { match: /^claude-haiku-4/, input: 1, output: 5 },
];
const FALLBACK = { input: 2, output: 10 };

/** Cost of one call in millionths of a dollar. */
export function aiCostMicros(model: string, inputTokens: number, outputTokens: number): number {
  const p = PRICES.find((x) => x.match.test(model)) ?? FALLBACK;
  const longHaiku = /^claude-haiku-5-5/.test(model) && inputTokens > 100_000 ? 5 : 1;
  return Math.round((inputTokens * p.input + outputTokens * p.output) * longHaiku);
}
