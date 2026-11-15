import { z } from "zod";

/** Request validation for builder data (bounded sizes protect storage and AI cost). */

const s = (max = 300) => z.string().max(max);

export const followUpSchema = z.object({ question: s(500), answer: s(2000) });

export const builderRoleSchema = z.object({
  title: s(),
  organization: s(),
  location: s(),
  start: s(40),
  end: s(40),
  description: s(4000),
  followups: z.array(followUpSchema).max(8),
});

export const builderAnswersSchema = z.object({
  target: z.object({ role: s(), field: s(), seniority: s(80), language: z.enum(["he", "en"]) }),
  personal: z.object({ fullName: s(120), phone: s(40), email: s(160), location: s(120), links: s(600) }),
  roles: z.array(builderRoleSchema).max(15),
  education: z
    .array(z.object({ degree: s(), institution: s(), start: s(40), end: s(40), details: s(600) }))
    .max(10),
  skills: s(2000),
  languages: s(400),
  certifications: s(1000),
  extra: s(2000),
});

export const templateSchema = z.enum(["classic", "modern", "minimal"]);
