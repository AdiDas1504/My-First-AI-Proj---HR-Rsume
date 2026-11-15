import type { TailoredResume } from "@/lib/types";

const LABELS = {
  he: { summary: "תקציר", experience: "ניסיון תעסוקתי", education: "השכלה", skills: "מיומנויות", languages: "שפות", certifications: "הסמכות", present: "היום" },
  en: { summary: "Summary", experience: "Experience", education: "Education", skills: "Skills", languages: "Languages", certifications: "Certifications", present: "Present" },
};

function range(start: string, end: string, present: string) {
  return [start, end || (start ? present : "")].filter(Boolean).join(" – ");
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 break-inside-avoid-page">
      <h2 className="border-b border-[#d9cbbe] pb-1 font-sans text-[0.8rem] font-bold uppercase tracking-[0.12em] text-[#1f4d3a]">
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

/** The resume as a printable A4 page. Used in the editor preview and the PDF print view. */
export function ResumePreview({ resume }: { resume: TailoredResume }) {
  const L = LABELS[resume.language];
  const dir = resume.language === "he" ? "rtl" : "ltr";
  const contact = [resume.contact.phone, resume.contact.email, resume.contact.location, ...resume.contact.links].filter(Boolean);

  return (
    <article
      dir={dir}
      lang={resume.language}
      className="mx-auto w-full max-w-[210mm] bg-white px-[14mm] py-[12mm] text-[10.5pt] leading-[1.5] text-[#1c1f1d] shadow-lift print:max-w-none print:p-0 print:shadow-none"
      style={{ fontFamily: resume.language === "he" ? '"Heebo Variable", Arial, sans-serif' : '"Heebo Variable", Helvetica, Arial, sans-serif' }}
    >
      <header>
        <h1 className="font-display text-[22pt] font-bold leading-tight text-[#1f4d3a]">{resume.fullName}</h1>
        {resume.headline && <p className="mt-1 text-[11.5pt] text-[#333]">{resume.headline}</p>}
        {contact.length > 0 && (
          <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[9.5pt] text-[#555]">
            {contact.map((c, i) => (
              <span key={i} dir="auto">
                {c}
              </span>
            ))}
          </p>
        )}
      </header>

      {resume.summary && (
        <Section title={L.summary}>
          <p>{resume.summary}</p>
        </Section>
      )}

      {resume.experience.length > 0 && (
        <Section title={L.experience}>
          <div className="space-y-4">
            {resume.experience.map((e, i) => (
              <div key={i} className="break-inside-avoid">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <p className="font-bold">
                    {e.title}
                    {e.organization && <span className="font-normal text-[#444]"> | {e.organization}</span>}
                  </p>
                  <p className="text-[9.5pt] text-[#555]" dir="auto">
                    {[range(e.start, e.end, L.present), e.location].filter(Boolean).join(" · ")}
                  </p>
                </div>
                {e.bullets.length > 0 && (
                  <ul className="mt-1.5 list-disc space-y-1 ps-5 marker:text-[#1f4d3a]">
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
        <Section title={L.education}>
          <div className="space-y-2.5">
            {resume.education.map((e, i) => (
              <div key={i} className="break-inside-avoid">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <p className="font-bold">
                    {e.degree}
                    {e.institution && <span className="font-normal text-[#444]"> | {e.institution}</span>}
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
        <Section title={L.skills}>
          <p>{resume.skills.join(" · ")}</p>
        </Section>
      )}
      {resume.certifications.length > 0 && (
        <Section title={L.certifications}>
          <p>{resume.certifications.join(" · ")}</p>
        </Section>
      )}
      {resume.languages.length > 0 && (
        <Section title={L.languages}>
          <p>{resume.languages.join(" · ")}</p>
        </Section>
      )}
    </article>
  );
}
