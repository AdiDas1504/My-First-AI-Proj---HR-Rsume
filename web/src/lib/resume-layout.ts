import type { ExperienceItem } from "./types";

/** Shared layout helpers for the resume preview and the Word export. */

const MILITARY_RE = /צה["״']?ל|צבא|שירות לאומי|שירות צבאי|מילואים|\bIDF\b|military|national service/i;

/** Military / national service goes in its own section, as Israeli resumes usually do. */
export function isMilitary(e: Pick<ExperienceItem, "organization" | "title"> & { military?: boolean }): boolean {
  return Boolean(e.military) || MILITARY_RE.test(`${e.organization} ${e.title}`);
}

/**
 * Splits skills into soft/professional skills and tools. Tools and software are
 * written in Latin script in Israeli resumes (Excel, SAP, Power BI), so that is
 * the signal; it works for English resumes too because of the known-tools list.
 */
const KNOWN_TOOLS = /excel|word|powerpoint|outlook|office|sap|salesforce|jira|monday|power ?bi|tableau|sql|python|figma|photoshop|autocad|erp|crm|google|notion|slack|microsoft|java|javascript|react|node|aws|azure|ai\b/i;

export function splitSkills(skills: string[], language: "he" | "en"): { skills: string[]; tools: string[] } {
  const tools: string[] = [];
  const rest: string[] = [];
  for (const s of skills) {
    const latin = /[a-z]/i.test(s);
    const isTool = language === "he" ? latin : KNOWN_TOOLS.test(s);
    (isTool ? tools : rest).push(s);
  }
  return { skills: rest, tools };
}
