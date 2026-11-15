import { z } from "zod";

/** Validation for user edits to a resume (tailored or built). */
const s = z.string().max(2000);

export const resumeEditSchema = z.object({
  language: z.enum(["he", "en"]),
  fullName: s,
  headline: s,
  contact: z.object({ email: s, phone: s, location: s, links: z.array(s).max(10) }),
  summary: z.string().max(3000),
  experience: z
    .array(
      z.object({
        title: s,
        organization: s,
        location: s,
        start: s,
        end: s,
        bullets: z.array(s).max(15),
        military: z.boolean().optional(),
      }),
    )
    .max(20),
  education: z.array(z.object({ degree: s, institution: s, start: s, end: s, details: s })).max(10),
  skills: z.array(s).max(60),
  languages: z.array(s).max(15),
  certifications: z.array(s).max(30),
});
