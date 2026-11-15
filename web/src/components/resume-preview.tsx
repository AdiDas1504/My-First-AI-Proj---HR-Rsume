import type { ResumeTemplate, TailoredResume } from "@/lib/types";

const LABELS = {
  he: { summary: "תקציר", experience: "ניסיון תעסוקתי", education: "השכלה", skills: "מיומנויות", languages: "שפות", certifications: "הסמכות", present: "היום" },
  en: { summary: "Summary", experience: "Experience", education: "Education", skills: "Skills", languages: "Languages", certifications: "Certifications", present: "Present" },
};

/**
 * Three designs, all single-column with real text so screening systems (ATS)
 * read them: classic (forest accents), modern (bold header band), minimal (ink only).
 */
const STYLES: Record<
  ResumeTemplate,
  { header: string; name: string; headline: string; contact: string; section: string; marker: string; org: string }
> = {
  classic: {
    header: "",
    name: "font-display text-[22pt] font-bold leading-tight text-[#1f4d3a]",
    headline: "mt-1 text-[11.5pt] text-[#333]",
    contact: "mt-2 text-[9.5pt] text-[#555]",
    section: "border-b border-[#d9cbbe] pb-1 font-sans text-[0.8rem] font-bold uppercase tracking-[0.12em] text-[#1f4d3a]",
    marker: "marker:text-[#1f4d3a]",
    org: "font-normal text-[#444]",
  },
  modern: {
    header: "-mx-[14mm] -mt-[12mm] mb-2 bg-[#1f4d3a] px-[14mm] pb-[7mm] pt-[10mm] text-white print:-mx-0 print:-mt-0 print:px-[8mm]",
    name: "font-sans text-[24pt] font-extrabold leading-tight tracking-tight text-white",
    headline: "mt-1 text-[12pt] font-medium text-[#fbe7c6]",
    contact: "mt-3 text-[9.5pt] text-white/85",
    section:
      "flex items-center gap-2 font-sans text-[10.5pt] font-extrabold text-[#1f4d3a] before:inline-block before:h-[1.1em] before:w-[4px] before:rounded-full before:bg-[#e9a23b] before:content-['']",
    marker: "marker:text-[#e9a23b]",
    org: "font-semibold text-[#1f4d3a]",
  },
  minimal: {
    header: "text-center",
    name: "font-display text-[24pt] font-medium leading-tight tracking-tight text-[#111]",
    headline: "mt-1 text-[11pt] tracking-wide text-[#444]",
    contact: "mt-2 justify-center text-[9.5pt] text-[#666]",
    section: "border-b border-[#111] pb-1 font-sans text-[9.5pt] font-semibold uppercase tracking-[0.2em] text-[#111]",
    marker: "marker:text-[#111]",
    org: "font-normal text-[#555]",
  },
};

function Section({ title, className, children }: { title: string; className: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 break-inside-avoid-page">
      <h2 className={className}>{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function range(start: string, end: string, present: string) {
  return [start, end || (start ? present : "")].filter(Boolean).join(" – ");
}

/** The resume as a printable A4 page. Used in editor previews and the PDF print view. */
export function ResumePreview({ resume, template = "classic" }: { resume: TailoredResume; template?: ResumeTemplate }) {
  const L = LABELS[resume.language];
  const t = STYLES[template];
  const dir = resume.language === "he" ? "rtl" : "ltr";
  const contact = [resume.contact.phone, resume.contact.email, resume.contact.location, ...resume.contact.links].filter(Boolean);

  return (
    <article
      dir={dir}
      lang={resume.language}
      className="mx-auto w-full max-w-[210mm] overflow-hidden bg-white px-[14mm] py-[12mm] text-[10.5pt] leading-[1.5] text-[#1c1f1d] shadow-lift print:max-w-none print:p-0 print:shadow-none"
      style={{ fontFamily: '"Heebo Variable", Arial, Helvetica, sans-serif' }}
    >
      <header className={t.header}>
        <h1 className={t.name}>{resume.fullName}</h1>
        {resume.headline && <p className={t.headline}>{resume.headline}</p>}
        {contact.length > 0 && (
          <p className={`flex flex-wrap gap-x-3 gap-y-1 ${t.contact}`}>
            {contact.map((c, i) => (
              <span key={i} dir="auto">
                {c}
              </span>
            ))}
          </p>
        )}
      </header>

      {resume.summary && (
        <Section title={L.summary} className={t.section}>
          <p>{resume.summary}</p>
        </Section>
      )}

      {resume.experience.length > 0 && (
        <Section title={L.experience} className={t.section}>
          <div className="space-y-4">
            {resume.experience.map((e, i) => (
              <div key={i} className="break-inside-avoid">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <p className="font-bold">
                    {e.title}
                    {e.organization && <span className={t.org}> | {e.organization}</span>}
                  </p>
                  <p className="text-[9.5pt] text-[#555]" dir="auto">
                    {[range(e.start, e.end, L.present), e.location].filter(Boolean).join(" · ")}
                  </p>
                </div>
                {e.bullets.length > 0 && (
                  <ul className={`mt-1.5 list-disc space-y-1 ps-5 ${t.marker}`}>
                    {e.bullets.map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {resume.education.length > 0 && (
        <Section title={L.education} className={t.section}>
          <div className="space-y-2.5">
            {resume.education.map((e, i) => (
              <div key={i} className="break-inside-avoid">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <p className="font-bold">
                    {e.degree}
                    {e.institution && <span className={t.org}> | {e.institution}</span>}
                  </p>
                  <p className="text-[9.5pt] text-[#555]" dir="auto">{range(e.start, e.end, L.present)}</p>
                </div>
                {e.details && <p className="text-[#444]">{e.details}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {resume.skills.length > 0 && (
        <Section title={L.skills} className={t.section}>
          <p>{resume.skills.join(" · ")}</p>
        </Section>
      )}
      {resume.certifications.length > 0 && (
        <Section title={L.certifications} className={t.section}>
          <p>{resume.certifications.join(" · ")}</p>
        </Section>
      )}
      {resume.languages.length > 0 && (
        <Section title={L.languages} className={t.section}>
          <p>{resume.languages.join(" · ")}</p>
        </Section>
      )}
    </article>
  );
}

export const TEMPLATE_NAMES: Record<ResumeTemplate, string> = {
  classic: "קלאסית",
  modern: "מודרנית",
  minimal: "מינימליסטית",
};
