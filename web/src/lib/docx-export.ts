import "server-only";
import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  TextRun,
  type IRunOptions,
} from "docx";
import type { TailoredResume } from "./types";

/**
 * ATS-friendly Word export: one column, real text (no tables or text boxes),
 * standard section headings, Arial, proper right-to-left paragraphs for Hebrew.
 */

const LABELS = {
  he: { summary: "תקציר", experience: "ניסיון תעסוקתי", education: "השכלה", skills: "מיומנויות", languages: "שפות", certifications: "הסמכות", present: "היום" },
  en: { summary: "Summary", experience: "Experience", education: "Education", skills: "Skills", languages: "Languages", certifications: "Certifications", present: "Present" },
};

const FOREST = "1F4D3A";

export async function buildResumeDocx(r: TailoredResume): Promise<Buffer> {
  const rtl = r.language === "he";
  const L = LABELS[r.language];
  const align = AlignmentType.START;

  const run = (text: string, opts: Partial<IRunOptions> = {}) =>
    new TextRun({
      text,
      font: "Arial",
      size: 21,
      sizeComplexScript: 21,
      rightToLeft: rtl,
      ...opts,
      ...(opts.bold ? { boldComplexScript: true } : {}),
    });

  const para = (children: TextRun[], extra: Record<string, unknown> = {}) =>
    new Paragraph({ children, bidirectional: rtl, alignment: align, spacing: { after: 60 }, ...extra });

  const heading = (text: string) =>
    new Paragraph({
      children: [run(text, { bold: true, size: 24, sizeComplexScript: 24, color: FOREST })],
      bidirectional: rtl,
      alignment: align,
      spacing: { before: 240, after: 80 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "D9CBBE", space: 2 } },
    });

  const bullet = (text: string) =>
    new Paragraph({
      children: [run(text)],
      bidirectional: rtl,
      alignment: align,
      bullet: { level: 0 },
      spacing: { after: 40 },
    });

  const dates = (start: string, end: string) =>
    [start, end || (start ? L.present : "")].filter(Boolean).join(" – ");

  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      children: [run(r.fullName, { bold: true, size: 36, sizeComplexScript: 36, color: FOREST })],
      bidirectional: rtl,
      alignment: align,
      spacing: { after: 40 },
    }),
  );
  if (r.headline) children.push(para([run(r.headline, { size: 23, sizeComplexScript: 23 })]));
  const contact = [r.contact.phone, r.contact.email, r.contact.location, ...r.contact.links].filter(Boolean);
  if (contact.length) children.push(para([run(contact.join("  |  "), { color: "555555" })]));

  if (r.summary) {
    children.push(heading(L.summary));
    children.push(para([run(r.summary)]));
  }

  if (r.experience.length) {
    children.push(heading(L.experience));
    for (const e of r.experience) {
      const titleLine = [e.title, e.organization].filter(Boolean).join(rtl ? " | " : " | ");
      children.push(para([run(titleLine, { bold: true })], { spacing: { before: 120, after: 20 } }));
      const meta = [dates(e.start, e.end), e.location].filter(Boolean).join(" · ");
      if (meta) children.push(para([run(meta, { color: "555555", size: 19, sizeComplexScript: 19 })]));
      e.bullets.forEach((b) => children.push(bullet(b)));
    }
  }

  if (r.education.length) {
    children.push(heading(L.education));
    for (const e of r.education) {
      children.push(para([run([e.degree, e.institution].filter(Boolean).join(" | "), { bold: true })], { spacing: { before: 80, after: 20 } }));
      const meta = [dates(e.start, e.end), e.details].filter(Boolean).join(" · ");
      if (meta) children.push(para([run(meta, { color: "555555", size: 19, sizeComplexScript: 19 })]));
    }
  }

  const listSection = (label: string, items: string[]) => {
    if (!items.length) return;
    children.push(heading(label));
    children.push(para([run(items.join(" · "))]));
  };
  listSection(L.skills, r.skills);
  listSection(L.certifications, r.certifications);
  listSection(L.languages, r.languages);

  const doc = new Document({
    creator: "JobFit",
    title: r.fullName,
    styles: { default: { document: { run: { font: "Arial" } } } },
    sections: [
      {
        properties: { page: { margin: { top: 900, bottom: 900, left: 1000, right: 1000 } } },
        children,
      },
    ],
  });
  return Packer.toBuffer(doc);
}

export async function buildLetterDocx(letter: string, language: "he" | "en"): Promise<Buffer> {
  const rtl = language === "he";
  const doc = new Document({
    creator: "JobFit",
    sections: [
      {
        children: letter.split("\n").map(
          (line) =>
            new Paragraph({
              children: [new TextRun({ text: line, font: "Arial", size: 22, sizeComplexScript: 22, rightToLeft: rtl })],
              bidirectional: rtl,
              alignment: AlignmentType.START,
              spacing: { after: 120 },
            }),
        ),
      },
    ],
  });
  return Packer.toBuffer(doc);
}
