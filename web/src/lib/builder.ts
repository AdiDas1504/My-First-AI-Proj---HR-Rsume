import type { BuilderAnswers, BuilderRole, TailoredResume } from "./types";

/** Pure helpers for the resume builder, shared by server and client. */

export function emptyRole(): BuilderRole {
  return { title: "", organization: "", location: "", start: "", end: "", description: "", followups: [] };
}

export function emptyAnswers(): BuilderAnswers {
  return {
    target: { role: "", field: "", seniority: "", language: "he" },
    personal: { fullName: "", phone: "", email: "", location: "", links: "" },
    roles: [emptyRole()],
    education: [],
    skills: "",
    languages: "",
    certifications: "",
    extra: "",
  };
}

export const splitList = (v: string) =>
  v
    .split(/[,\n،]/)
    .map((s) => s.trim())
    .filter(Boolean);

/**
 * Everything the person told us, as plain text. This is the fact source the
 * honesty check verifies the generated resume against (plus the original
 * resume text in improve mode).
 */
export function answersToText(a: BuilderAnswers): string {
  const lines: string[] = [
    a.personal.fullName,
    a.personal.phone,
    a.personal.email,
    a.personal.location,
    a.personal.links,
    `יעד: ${a.target.role} ${a.target.field} ${a.target.seniority}`,
  ];
  for (const r of a.roles) {
    lines.push(`${r.title} | ${r.organization} | ${r.location} | ${r.start} - ${r.end}`);
    lines.push(r.description);
    for (const f of r.followups) lines.push(`${f.question}\n${f.answer}`);
  }
  for (const e of a.education) lines.push(`${e.degree} | ${e.institution} | ${e.start} - ${e.end} | ${e.details}`);
  lines.push(a.skills, a.languages, a.certifications, a.extra);
  return lines.filter((l) => l && l.trim()).join("\n");
}

/** Has the person given us enough to write a real resume? */
export function readiness(a: BuilderAnswers): { ok: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!a.personal.fullName.trim()) missing.push("שם מלא");
  if (!a.personal.phone.trim() && !a.personal.email.trim()) missing.push("טלפון או אימייל");
  const realRoles = a.roles.filter((r) => r.title.trim() && (r.description.trim() || r.followups.some((f) => f.answer.trim())));
  if (realRoles.length === 0) missing.push("לפחות תפקיד אחד עם תיאור של מה עשית");
  return { ok: missing.length === 0, missing };
}

/** Deterministic assembly used in demo mode (no AI): copies answers as-is. */
export function assembleResume(a: BuilderAnswers): TailoredResume {
  return {
    language: a.target.language,
    fullName: a.personal.fullName,
    headline: a.target.role,
    contact: {
      email: a.personal.email,
      phone: a.personal.phone,
      location: a.personal.location,
      links: splitList(a.personal.links),
    },
    summary: "",
    experience: a.roles
      .filter((r) => r.title.trim())
      .map((r) => ({
        title: r.title,
        organization: r.organization,
        location: r.location,
        start: r.start,
        end: r.end,
        bullets: [
          ...r.description.split("\n").map((s) => s.trim()).filter(Boolean),
          ...r.followups.map((f) => f.answer.trim()).filter(Boolean),
        ],
      })),
    education: a.education.filter((e) => e.degree.trim() || e.institution.trim()),
    skills: splitList(a.skills),
    languages: splitList(a.languages),
    certifications: splitList(a.certifications),
  };
}

/** Plain-text rendering of a resume, used as the source when tailoring a built resume. */
export function resumeToText(r: TailoredResume): string {
  const lines = [r.fullName, r.headline, [r.contact.phone, r.contact.email, r.contact.location, ...r.contact.links].filter(Boolean).join(" | "), "", r.summary, ""];
  for (const e of r.experience) {
    lines.push(`${e.title} | ${e.organization} | ${e.location} | ${e.start} - ${e.end}`);
    for (const b of e.bullets) lines.push(`- ${b}`);
    lines.push("");
  }
  for (const e of r.education) lines.push(`${e.degree} | ${e.institution} | ${e.start} - ${e.end} ${e.details}`);
  if (r.skills.length) lines.push(`Skills: ${r.skills.join(", ")}`);
  if (r.certifications.length) lines.push(`Certifications: ${r.certifications.join(", ")}`);
  if (r.languages.length) lines.push(`Languages: ${r.languages.join(", ")}`);
  return lines.join("\n").trim();
}
