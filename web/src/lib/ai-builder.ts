import "server-only";
import { z } from "zod";
import { config, demo } from "./config";
import { HONESTY_RULES, USER_VOICE, callTool, resumeJsonSchema, resumeSchema } from "./ai";
import { assembleResume, emptyAnswers, emptyRole } from "./builder";
import type { BuilderAnswers, BuilderRole, TailoredResume } from "./types";

/**
 * AI for the resume builder. The model asks and writes; it never supplies
 * facts. Every fact in the final resume must come from the person's answers
 * or their original resume.
 */

const BUILDER_RULES = `
${HONESTY_RULES}

Additional builder rules:
- Facts come only from the person's answers and their original resume. If something is unknown, leave it out. Never fill gaps with plausible-sounding details.
- Follow-up questions must ask for facts (scope, numbers, tools, results, who they worked with). Never suggest an answer, never put words in their mouth.
`.trim();

/* ---------------- improve mode: read and diagnose an existing resume ---------------- */

const roleJson = {
  type: "object",
  properties: {
    title: { type: "string" },
    organization: { type: "string" },
    location: { type: "string" },
    start: { type: "string" },
    end: { type: "string", description: "Empty string if current" },
    description: { type: "string", description: "Everything the resume says about this role, copied faithfully, one item per line" },
    followups: {
      type: "array",
      description: "2-3 Hebrew questions, second person, asking for facts that would make this role stronger (results, scope, numbers, tools). Empty if the role is already strong.",
      items: { type: "string" },
    },
  },
  required: ["title", "organization", "location", "start", "end", "description", "followups"],
} as const;

const diagnoseSchema = z.object({
  fullName: z.string().default(""),
  phone: z.string().default(""),
  email: z.string().default(""),
  location: z.string().default(""),
  links: z.array(z.string()).default([]),
  targetRole: z.string().default(""),
  language: z.enum(["he", "en"]).default("he"),
  roles: z.array(
    z.object({
      title: z.string(),
      organization: z.string().default(""),
      location: z.string().default(""),
      start: z.string().default(""),
      end: z.string().default(""),
      description: z.string().default(""),
      followups: z.array(z.string()).default([]),
    }),
  ),
  education: z.array(
    z.object({
      degree: z.string(),
      institution: z.string().default(""),
      start: z.string().default(""),
      end: z.string().default(""),
      details: z.string().default(""),
    }),
  ),
  skills: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([]),
  diagnosis: z.array(z.string()).default([]),
});

export async function runDiagnose(resumeText: string): Promise<{ answers: BuilderAnswers; diagnosis: string[] }> {
  if (demo.ai) return demoDiagnose(resumeText);
  const out = await callTool({
    model: config.modelScan,
    maxTokens: 6000,
    system: `${BUILDER_RULES}

${USER_VOICE}

Task: read the person's existing resume, extract it faithfully into fields, and diagnose what makes it weak.
- Copy facts exactly. Do not improve wording at this stage.
- diagnosis: 3-5 short Hebrew points in second person on what weakens this resume (e.g. duties without results, vague roles, missing summary, unclear dates). Be specific and kind.
- For each role, write 2-3 follow-up questions that would let us strengthen it with real facts.`,
    content: [{ type: "text", text: `<resume>\n${resumeText}\n</resume>` }],
    tool: {
      name: "extract_and_diagnose",
      description: "Return the extracted resume fields and the diagnosis",
      input_schema: {
        type: "object",
        properties: {
          fullName: { type: "string" },
          phone: { type: "string" },
          email: { type: "string" },
          location: { type: "string" },
          links: { type: "array", items: { type: "string" } },
          targetRole: { type: "string", description: "The role this person seems to aim for, from their resume; empty if unclear" },
          language: { type: "string", enum: ["he", "en"] },
          roles: { type: "array", items: roleJson },
          education: {
            type: "array",
            items: {
              type: "object",
              properties: {
                degree: { type: "string" },
                institution: { type: "string" },
                start: { type: "string" },
                end: { type: "string" },
                details: { type: "string" },
              },
              required: ["degree", "institution", "start", "end", "details"],
            },
          },
          skills: { type: "array", items: { type: "string" } },
          languages: { type: "array", items: { type: "string" } },
          certifications: { type: "array", items: { type: "string" } },
          diagnosis: { type: "array", items: { type: "string" } },
        },
        required: ["fullName", "phone", "email", "location", "links", "targetRole", "language", "roles", "education", "skills", "languages", "certifications", "diagnosis"],
      },
    },
    schema: diagnoseSchema,
  });

  const answers = emptyAnswers();
  answers.target = { role: out.targetRole, field: "", seniority: "", language: out.language };
  answers.personal = { fullName: out.fullName, phone: out.phone, email: out.email, location: out.location, links: out.links.join(", ") };
  answers.roles = out.roles.length
    ? out.roles.map((r) => ({
        title: r.title,
        organization: r.organization,
        location: r.location,
        start: r.start,
        end: r.end,
        description: r.description,
        followups: r.followups.slice(0, 3).map((q) => ({ question: q, answer: "" })),
      }))
    : [emptyRole()];
  answers.education = out.education;
  answers.skills = out.skills.join(", ");
  answers.languages = out.languages.join(", ");
  answers.certifications = out.certifications.join(", ");
  return { answers, diagnosis: out.diagnosis.slice(0, 5) };
}

/* ---------------- follow-up questions for one role ---------------- */

export async function runFollowups(role: BuilderRole, target: BuilderAnswers["target"]): Promise<string[]> {
  if (demo.ai) {
    return [
      "מה הייתה התוצאה הכי משמעותית שהשגת בתפקיד הזה?",
      "עם כמה אנשים, לקוחות או ספקים עבדת באופן קבוע?",
      "באילו כלים, מערכות או תוכנות השתמשת?",
    ];
  }
  const out = await callTool({
    model: config.modelScan,
    maxTokens: 800,
    system: `${BUILDER_RULES}

${USER_VOICE}

Task: ask 2-3 short follow-up questions in Hebrew (second person) that would let us describe this role much better for the person's target job. Ask about concrete facts the description is missing: results and what improved, scale (people, customers, budget, volume), tools and systems, responsibilities and who they reported to. Do not repeat what is already answered. Do not suggest answers.`,
    content: [
      {
        type: "text",
        text: `<target_job>${target.role} ${target.field} ${target.seniority}</target_job>\n<role>\n${JSON.stringify({
          title: role.title,
          organization: role.organization,
          description: role.description,
          alreadyAnswered: role.followups.filter((f) => f.answer.trim()),
        })}\n</role>`,
      },
    ],
    tool: {
      name: "ask_followups",
      description: "Return the follow-up questions",
      input_schema: { type: "object", properties: { questions: { type: "array", items: { type: "string" } } }, required: ["questions"] },
    },
    schema: z.object({ questions: z.array(z.string()) }),
  });
  return out.questions.slice(0, 3);
}

/* ---------------- build the final resume ---------------- */

export async function runBuild(
  answers: BuilderAnswers,
  sourceResumeText: string,
): Promise<{ resume: TailoredResume; notes: string[] }> {
  if (demo.ai) return { resume: assembleResume(answers), notes: ["מצב הדגמה: קורות החיים הורכבו מהתשובות כמו שהן, בלי ניסוח מקצועי."] };
  const lang = answers.target.language === "en" ? "English" : "Hebrew";
  const out = await callTool({
    model: config.modelTailor,
    maxTokens: 10000,
    system: `${BUILDER_RULES}

Task: write a complete, professional, ready-to-send resume in ${lang} from the person's answers${sourceResumeText ? " and their original resume" : ""}, aimed at their target role.
- Turn their own words and follow-up answers into strong, concise achievement bullets (action + what + result/scale when they gave one). Up to 6 bullets per role, most relevant first.
- Every number, employer, title, date, tool, degree and certification must appear in the answers or original resume. If they gave no result, write the responsibility well; do not invent one.
- Write a 2-4 sentence summary built only from their real experience, framed for the target role.
- Headline: their target role or most recent real title. Military or national service is a normal experience entry when given.
- Keep dates exactly as given. Translate faithfully if the source language differs; translation adds nothing.
- notes: 2-5 short Hebrew points (second person) on what you emphasised and what they could add later if true.`,
    content: [
      {
        type: "text",
        text: `<answers>\n${JSON.stringify(answers)}\n</answers>${sourceResumeText ? `\n<original_resume>\n${sourceResumeText}\n</original_resume>` : ""}`,
      },
    ],
    tool: {
      name: "deliver_resume",
      description: "Deliver the finished resume",
      input_schema: {
        type: "object",
        properties: { resume: resumeJsonSchema, notes: { type: "array", items: { type: "string" } } },
        required: ["resume", "notes"],
      },
    },
    schema: z.object({ resume: resumeSchema, notes: z.array(z.string()).default([]) }),
  });
  return { resume: { ...out.resume, language: answers.target.language }, notes: out.notes.slice(0, 5) };
}

/* ---------------- demo (no API key) ---------------- */

function demoDiagnose(resumeText: string): { answers: BuilderAnswers; diagnosis: string[] } {
  const lines = resumeText.split("\n").map((l) => l.trim()).filter(Boolean);
  const answers = emptyAnswers();
  answers.personal.fullName = lines[0]?.slice(0, 60) ?? "";
  answers.personal.email = resumeText.match(/[\w.+-]+@[\w-]+\.[\w.]+/)?.[0] ?? "";
  answers.personal.phone = resumeText.match(/(?:\+972|0)5\d[- ]?\d{3}[- ]?\d{4}/)?.[0] ?? "";
  answers.target.role = lines[1]?.slice(0, 80) ?? "";
  answers.roles = [
    {
      ...emptyRole(),
      title: lines[1]?.slice(0, 80) ?? "",
      description: lines.filter((l) => l.length > 30).slice(0, 6).join("\n"),
      followups: [
        { question: "מה הייתה התוצאה הכי משמעותית שהשגת בתפקיד הזה?", answer: "" },
        { question: "באילו כלים או מערכות השתמשת?", answer: "" },
      ],
    },
  ];
  return {
    answers,
    diagnosis: ["מצב הדגמה: עם חיבור ל-AI תקבלו כאן אבחון אמיתי של מה שמחליש את קורות החיים, ושאלות ממוקדות לכל תפקיד."],
  };
}
