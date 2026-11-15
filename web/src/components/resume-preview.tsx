import { isMilitary, splitSkills } from "@/lib/resume-layout";
import type { ExperienceItem, ResumeTemplate, TailoredResume } from "@/lib/types";

const LABELS = {
  he: {
    about: "על עצמי",
    experience: "ניסיון תעסוקתי",
    military: "שירות צבאי",
    education: "השכלה",
    skills: "כישורים",
    tools: "כלים מקצועיים",
    languages: "שפות",
    certifications: "הסמכות",
    present: "היום",
  },
  en: {
    about: "Profile",
    experience: "Experience",
    military: "Military Service",
    education: "Education",
    skills: "Skills",
    tools: "Tools",
    languages: "Languages",
    certifications: "Certifications",
    present: "Present",
  },
};

/**
 * Two-column layout, as Israeli resumes are written today: a colored sidebar
 * (name, contact, education, skills, tools, languages) and a main column
 * (profile, experience, military service). Three color themes.
 */
const THEMES: Record<
  ResumeTemplate,
  { side: string; sideHead: string; sideText: string; sideMuted: string; sideMarker: string; mainHead: string; marker: string; titleRule: string }
> = {
  classic: {
    side: "bg-[#3e5c80] text-white",
    sideHead: "text-white",
    sideText: "text-white",
    sideMuted: "text-white/80",
    sideMarker: "marker:text-white/70",
    mainHead: "text-[#3e5c80]",
    marker: "marker:text-[#3e5c80]",
    titleRule: "",
  },
  modern: {
    side: "bg-[#1f4d3a] text-white",
    sideHead: "text-[#fbe7c6]",
    sideText: "text-white",
    sideMuted: "text-white/80",
    sideMarker: "marker:text-[#e9a23b]",
    mainHead: "text-[#1f4d3a]",
    marker: "marker:text-[#e9a23b]",
    titleRule: "border-b-2 border-[#e9a23b] pb-1",
  },
  minimal: {
    side: "bg-[#f2efeb] text-[#1c1f1d]",
    sideHead: "text-[#111]",
    sideText: "text-[#1c1f1d]",
    sideMuted: "text-[#555]",
    sideMarker: "marker:text-[#111]",
    mainHead: "text-[#111]",
    marker: "marker:text-[#111]",
    titleRule: "border-b border-[#111] pb-1",
  },
};

function range(start: string, end: string, present: string) {
  return [start, end || (start ? present : "")].filter(Boolean).join(" – ");
}

function SideSection({ title, className, children }: { title: string; className: string; children: React.ReactNode }) {
  return (
    <section className="mt-7 break-inside-avoid">
      <h2 className={`text-[13pt] font-bold leading-tight ${className}`}>{title}</h2>
      <div className="mt-2.5 space-y-1.5">{children}</div>
    </section>
  );
}

function SideList({ items, className }: { items: string[]; className: string }) {
  return (
    <ul className={`list-[square] space-y-1 ps-4 ${className}`}>
      {items.map((s, i) => (
        <li key={i}>
          <bdi>{s}</bdi>
        </li>
      ))}
    </ul>
  );
}

const GENERIC_SERVICE = /^\s*(שירות צבאי|שירות לאומי|צה["״']?ל|military service|national service|idf)\s*$/i;

function Job({ e, present, marker }: { e: ExperienceItem; present: string; marker: string }) {
  const org = GENERIC_SERVICE.test(e.organization) ? "" : e.organization;
  return (
    <div className="break-inside-avoid">
      <p className="text-[11.5pt] font-bold leading-snug">
        {e.title}
        {org && <> | {org}</>}
      </p>
      <p className="mt-0.5 text-[9.5pt] italic text-[#555]">
        <bdi>{[range(e.start, e.end, present), e.location].filter(Boolean).join(" · ")}</bdi>
      </p>
      {e.bullets.length > 0 && (
        <ul className={`mt-1.5 list-[square] space-y-1 ps-5 ${marker}`}>
          {e.bullets.map((b, j) => (
            <li key={j}>{b}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MainSection({ title, className, children }: { title: string; className: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className={`text-[15pt] font-bold leading-tight ${className}`}>{title}</h2>
      <div className="mt-3 space-y-4">{children}</div>
    </section>
  );
}

/** The resume as a printable A4 page. Used in editor previews and the PDF print view. */
export function ResumePreview({ resume, template = "classic" }: { resume: TailoredResume; template?: ResumeTemplate }) {
  const L = LABELS[resume.language];
  const t = THEMES[template];
  const dir = resume.language === "he" ? "rtl" : "ltr";
  const contact = [resume.contact.email, resume.contact.phone, resume.contact.location, ...resume.contact.links].filter(Boolean);
  const jobs = resume.experience.filter((e) => !isMilitary(e));
  const service = resume.experience.filter((e) => isMilitary(e));
  const { skills, tools } = splitSkills(resume.skills, resume.language);
  const sideList = `${t.sideText} ${t.sideMarker}`;

  return (
    <article
      dir={dir}
      lang={resume.language}
      className="mx-auto grid min-h-[297mm] w-full min-w-[170mm] max-w-[210mm] grid-cols-[34%_1fr] bg-white text-[10.5pt] leading-[1.45] text-[#1c1f1d] shadow-lift print:max-w-none print:shadow-none"
      style={{ fontFamily: '"Heebo Variable", Arial, Helvetica, sans-serif' }}
    >
      {/* ---------- sidebar ---------- */}
      <aside className={`px-[7mm] py-[11mm] ${t.side}`}>
        <h1 className={`text-[22pt] font-extrabold leading-[1.1] ${t.sideHead}`}>{resume.fullName}</h1>
        {contact.length > 0 && (
          <ul className={`mt-4 space-y-1 text-[9.5pt] ${t.sideText}`}>
            {contact.map((c, i) => (
              <li key={i} className="break-words">
                <bdi>{c}</bdi>
              </li>
            ))}
          </ul>
        )}

        {resume.education.length > 0 && (
          <SideSection title={L.education} className={t.sideHead}>
            {resume.education.map((e, i) => (
              <div key={i} className="break-inside-avoid pb-1.5">
                <p className="font-bold leading-snug">{e.degree}</p>
                {e.institution && <p className={t.sideText}>{e.institution}</p>}
                {(e.start || e.end) && (
                  <p className={`text-[9.5pt] ${t.sideMuted}`}>
                    <bdi>{range(e.start, e.end, L.present)}</bdi>
                  </p>
                )}
                {e.details && <p className={`mt-1 text-[9.5pt] ${t.sideMuted}`}>{e.details}</p>}
              </div>
            ))}
          </SideSection>
        )}
        {skills.length > 0 && (
          <SideSection title={L.skills} className={t.sideHead}>
            <SideList items={skills} className={sideList} />
          </SideSection>
        )}
        {tools.length > 0 && (
          <SideSection title={L.tools} className={t.sideHead}>
            <SideList items={tools} className={sideList} />
          </SideSection>
        )}
        {resume.certifications.length > 0 && (
          <SideSection title={L.certifications} className={t.sideHead}>
            <SideList items={resume.certifications} className={sideList} />
          </SideSection>
        )}
        {resume.languages.length > 0 && (
          <SideSection title={L.languages} className={t.sideHead}>
            <SideList items={resume.languages} className={sideList} />
          </SideSection>
        )}
      </aside>

      {/* ---------- main column ---------- */}
      <div className="px-[9mm] py-[11mm]">
        {resume.summary && (
          <section>
            <h2 className={`text-[18pt] font-extrabold leading-tight text-[#1c1f1d] ${t.titleRule}`}>{L.about}</h2>
            <p className="mt-2">{resume.summary}</p>
          </section>
        )}
        {jobs.length > 0 && (
          <MainSection title={L.experience} className={t.mainHead}>
            {jobs.map((e, i) => (
              <Job key={i} e={e} present={L.present} marker={t.marker} />
            ))}
          </MainSection>
        )}
        {service.length > 0 && (
          <MainSection title={L.military} className={t.mainHead}>
            {service.map((e, i) => (
              <Job key={i} e={e} present={L.present} marker={t.marker} />
            ))}
          </MainSection>
        )}
      </div>
    </article>
  );
}

export const TEMPLATE_NAMES: Record<ResumeTemplate, string> = {
  classic: "כחול קלאסי",
  modern: "ירוק מודרני",
  minimal: "בהיר מינימליסטי",
};
