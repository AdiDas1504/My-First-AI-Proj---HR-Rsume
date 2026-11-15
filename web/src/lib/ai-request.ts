/**
 * Model-specific request shaping for structured (tool) answers.
 *
 * Claude Sonnet 5.5, Opus 5.5 and the Fable/Mythos family reject forced tool
 * use (tool_choice "tool"/"any") with a 400. For those we send tool_choice
 * "auto", mark the tool strict (schema-valid input guaranteed) and tell the
 * model in the prompt to answer through the tool. Haiku 5.5 still accepts
 * forced tool use, which is the most reliable option where available.
 */

export function rejectsForcedToolUse(model: string): boolean {
  return /^claude-(sonnet-5-5|opus-5-5|fable-5|mythos-5)/.test(model);
}

/** Claude Sonnet 5.5 turns off up-front thinking with "between_tools" (it rejects "disabled"). */
export function thinkingFor(model: string): { type: "between_tools" } | undefined {
  return /^claude-sonnet-5-5/.test(model) ? { type: "between_tools" } : undefined;
}

type Json = Record<string, unknown>;

/** Strict tool use needs additionalProperties: false on every object in the schema. */
export function toStrictSchema<T>(schema: T): T {
  const walk = (node: unknown): unknown => {
    if (Array.isArray(node)) return node.map(walk);
    if (!node || typeof node !== "object") return node;
    const out: Json = {};
    for (const [k, v] of Object.entries(node as Json)) out[k] = walk(v);
    if (out.type === "object") out.additionalProperties = false;
    return out;
  };
  return walk(schema) as T;
}
