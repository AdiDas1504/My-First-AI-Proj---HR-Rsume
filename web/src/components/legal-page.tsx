export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="container-page py-14">
      <article className="mx-auto max-w-3xl">
        <h1 className="text-4xl md:text-5xl">{title}</h1>
        <p className="mt-3 text-muted">עודכן לאחרונה: {updated}</p>
        <div className="mt-10 space-y-8 text-[1.05rem] leading-8 [&_h2]:mb-3 [&_h2]:text-2xl [&_li]:ms-5 [&_li]:list-disc [&_ul]:space-y-1.5">
          {children}
        </div>
      </article>
    </div>
  );
}
