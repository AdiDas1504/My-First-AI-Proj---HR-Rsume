/**
 * Quality evaluation against the real Claude API.
 *
 *   ANTHROPIC_API_KEY=... npm run eval            (from web/)
 *   EVAL_REPS=2  EVAL_PARTS=scan,analyze,tailor   (optional)
 *
 * Measures what users complained about:
 *  1. Do scores really differ between strong, partial and poor fits? Are they stable?
 *  2. Does the analysis research what the role needs beyond the ad, ask about it,
 *     and use the answers in the resume without inventing anything?
 * Writes a Markdown report to eval/results/latest.md (fictional data only).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { answersToSource, runAnalyze, runScan, runTailor, type AnalyzeOutput, type CandidateAnswer } from "../src/lib/ai";
import { checkHonesty } from "../src/lib/honesty";
import type { JobInput } from "../src/lib/extract";
import { EXPECTED, HR_CASE, JOBS, RESUMES, type JobId, type ResumeId } from "./fixtures";

const REPS = Math.max(1, Number(process.env.EVAL_REPS ?? 2));
const PARTS = new Set((process.env.EVAL_PARTS ?? "scan,analyze,tailor").split(","));
const job = (id: JobId): JobInput => ({ kind: "text", text: JOBS[id] });
const resumeIds = Object.keys(RESUMES) as ResumeId[];
const jobIds = Object.keys(JOBS) as JobId[];

async function retry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  for (let i = 0; ; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i >= 3) throw new Error(`${label}: ${(err as Error).message}`);
      await new Promise((r) => setTimeout(r, 4000 * (i + 1)));
    }
  }
}

async function pool<T>(tasks: (() => Promise<T>)[], size: number): Promise<T[]> {
  const out: T[] = new Array(tasks.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (next < tasks.length) {
        const i = next++;
        out[i] = await tasks[i]();
      }
    }),
  );
  return out;
}

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN);
const sd = (xs: number[]) => Math.sqrt(mean(xs.map((x) => (x - mean(xs)) ** 2)));
const inBand = (s: number, [lo, hi]: [number, number]) => s >= lo && s <= hi;
const best = (j: JobId) => resumeIds.reduce((a, b) => (EXPECTED[j][a][0] >= EXPECTED[j][b][0] ? a : b));

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("Set ANTHROPIC_API_KEY to run the evaluation against Claude.");
  const lines: string[] = [`# JobFit quality evaluation`, ``, `Date: ${new Date().toISOString()} · scan reps: ${REPS}`, ``];
  const checks: { name: string; ok: boolean; detail: string }[] = [];
  const check = (name: string, ok: boolean, detail = "") => checks.push({ name, ok, detail });

  /* ---------- 1. free scan: the full matrix, repeated ---------- */
  const scan: Record<string, number[]> = {};
  if (PARTS.has("scan")) {
    const tasks = jobIds.flatMap((j) =>
      resumeIds.flatMap((r) =>
        Array.from({ length: REPS }, () => async () => {
          const res = await retry(() => runScan(RESUMES[r], job(j)), `scan ${r}/${j}`);
          (scan[`${j}|${r}`] ??= []).push(res.score);
        }),
      ),
    );
    await pool(tasks, 4);

    lines.push(`## 1. Free scan (Haiku): score matrix`, ``, `| job \\ resume | ${resumeIds.join(" | ")} |`, `|---|${resumeIds.map(() => "---").join("|")}|`);
    for (const j of jobIds) {
      lines.push(
        `| ${j} | ${resumeIds
          .map((r) => {
            const s = scan[`${j}|${r}`];
            const ok = s.every((x) => inBand(x, EXPECTED[j][r]));
            return `${s.join(" / ")} ${ok ? "" : `⚠️ (${EXPECTED[j][r].join("-")})`}`;
          })
          .join(" | ")} |`,
      );
    }
    const diag = jobIds.flatMap((j) => scan[`${j}|${best(j)}`]);
    const off = jobIds.flatMap((j) => resumeIds.filter((r) => EXPECTED[j][r][1] <= 40).flatMap((r) => scan[`${j}|${r}`]));
    const drift = Math.max(...Object.values(scan).map((s) => Math.max(...s) - Math.min(...s)));
    const all = Object.values(scan).flat();
    const bands = Object.entries(scan).filter(([k, s]) => {
      const [j, r] = k.split("|") as [JobId, ResumeId];
      return s.every((x) => inBand(x, EXPECTED[j][r]));
    }).length;
    lines.push(
      ``,
      `- Best-fit average: **${mean(diag).toFixed(0)}** · poor-fit average: **${mean(off).toFixed(0)}** · separation: **${(mean(diag) - mean(off)).toFixed(0)}**`,
      `- Spread (standard deviation of all scores): **${sd(all).toFixed(0)}**`,
      `- Largest change between repeated runs of the same pair: **${drift}** points`,
      `- Pairs inside their expected band: **${bands}/${Object.keys(scan).length}**`,
      ``,
    );
    check("scan: separation between best and poor fits ≥ 45", mean(diag) - mean(off) >= 45, `${(mean(diag) - mean(off)).toFixed(0)}`);
    check("scan: repeated runs differ by ≤ 12 points", drift <= 12, `${drift}`);
    check("scan: ≥ 80% of pairs inside expected band", bands / Object.keys(scan).length >= 0.8, `${bands}/${Object.keys(scan).length}`);
    for (const j of jobIds) {
      const top = resumeIds.reduce((a, b) => (mean(scan[`${j}|${a}`]) >= mean(scan[`${j}|${b}`]) ? a : b));
      check(`scan: best candidate ranks first for ${j}`, top === best(j) || (j === "hrManagerJob" && top === "hrManagerPlain"), top);
    }
  }

  /* ---------- 2. full analysis (Sonnet) on key pairs ---------- */
  const analyses: Record<string, AnalyzeOutput> = {};
  if (PARTS.has("analyze") || PARTS.has("tailor")) {
    const pairs: [JobId, ResumeId][] = [
      ["hrManagerJob", "hrManager"],
      ["hrManagerJob", "hrManagerPlain"],
      ["hrManagerJob", "hrGeneralist"],
      ["hrManagerJob", "projectManager"],
      ["accountantJob", "accountant"],
      ["accountantJob", "hrManager"],
      ["projectManagerJob", "projectManager"],
      ["projectManagerJob", "accountant"],
      ["frontendJob", "juniorDev"],
      ["frontendJob", "projectManager"],
    ];
    const todo = PARTS.has("analyze") ? pairs : pairs.filter(([j, r]) => j === HR_CASE.job && r === HR_CASE.resume);
    await pool(
      todo.map(([j, r]) => async () => {
        analyses[`${j}|${r}`] = await retry(() => runAnalyze(RESUMES[r], job(j)), `analyze ${r}/${j}`);
      }),
      3,
    );
    if (PARTS.has("analyze")) {
      lines.push(`## 2. Full analysis (Sonnet)`, ``, `| pair | expected | score | alignment | seniority | requirements (met/partial/missing) | unverified quotes |`, `|---|---|---|---|---|---|---|`);
      let inside = 0;
      for (const [j, r] of todo) {
        const a = analyses[`${j}|${r}`].analysis;
        const c = (s: string) => a.requirements.filter((x) => x.status === s).length;
        const ok = inBand(a.score, EXPECTED[j][r]);
        inside += ok ? 1 : 0;
        lines.push(
          `| ${j} / ${r} | ${EXPECTED[j][r].join("-")} | ${a.score}${ok ? "" : " ⚠️"} | ${a.roleAlignment} | ${a.seniority} | ${c("met")}/${c("partial")}/${c("missing")} | ${a.requirements.filter((x) => x.verified === false).length} |`,
        );
      }
      lines.push(``);
      check("analysis: ≥ 80% of pairs inside expected band", inside / todo.length >= 0.8, `${inside}/${todo.length}`);
    }
  }

  /* ---------- 3. the HR case: research, questions, answers, writing ---------- */
  if (PARTS.has("tailor")) {
    const key = `${HR_CASE.job}|${HR_CASE.resume}`;
    const { analysis, questions } = analyses[key];
    const insights = analysis.insights ?? [];
    const research = insights.map((i) => `${i.topic} ${i.why}`).join("\n") + "\n" + questions.map((q) => q.question).join("\n");
    const found = HR_CASE.expectedTopics.filter((re) => re.test(research));
    lines.push(
      `## 3. HR case: research and questions`,
      ``,
      `Resume: a real HR manager whose resume lists tasks only. Ad: does not mention business partnering or metrics.`,
      ``,
      `**What the engine found the role needs:**`,
      ...insights.map((i) => `- ${i.topic} (${i.source === "role" ? "beyond the ad" : "in the ad"}, ${i.resumeStatus})`),
      ``,
      `**Questions it asked:**`,
      ...questions.map((q) => `- ${q.question}`),
      ``,
    );
    check("HR case: role research covers key expectations beyond the ad", found.length >= HR_CASE.minTopics, `${found.length}/${HR_CASE.expectedTopics.length} topics`);
    check("HR case: at least 3 expectations marked as beyond the ad", insights.filter((i) => i.source === "role").length >= 3, `${insights.filter((i) => i.source === "role").length}`);
    check("HR case: 3-7 questions", questions.length >= 3 && questions.length <= 7, `${questions.length}`);

    // Give each simulated answer to the question that asks about it.
    const topicOf = [/הנהל|עסק|אסטרטג|שותפ|יעד/, /מד(ד|ו)|נתונ|ROI|KPI|תחלופ|תוצא|השפע/, /ניהל|צוות|כפיפ|עובדים תחת/];
    const used = new Set<string>();
    const answers: CandidateAnswer[] = [];
    HR_CASE.answers.forEach((answer, n) => {
      const q = questions.find((x) => !used.has(x.id) && topicOf[n].test(x.question));
      if (q) {
        used.add(q.id);
        answers.push({ topic: q.topic, question: q.question, answer });
      }
    });
    check("HR case: asked about business partnering, metrics and team management", answers.length === HR_CASE.answers.length, `${answers.length}/${HR_CASE.answers.length} matched`);

    const lang = "auto" as const;
    const withAnswers = await retry(() => runTailor(RESUMES[HR_CASE.resume], job(HR_CASE.job), lang, { analysis, answers }), "tailor with answers");
    const noAnswers = await retry(() => runTailor(RESUMES[HR_CASE.resume], job(HR_CASE.job), lang, { analysis, answers: [] }), "tailor without answers");
    const text = (x: typeof withAnswers) => JSON.stringify(x.resume);
    const flagsWith = checkHonesty(withAnswers.resume, [RESUMES[HR_CASE.resume], answersToSource(answers)].join("\n\n"));
    const flagsWithout = checkHonesty(noAnswers.resume, RESUMES[HR_CASE.resume]);
    const usedTerms = HR_CASE.expectedInResume.filter((re) => re.test(text(withAnswers)));
    lines.push(
      `## 4. HR case: writing`,
      ``,
      `**With the answers** (summary): ${withAnswers.resume.summary}`,
      ``,
      `Most recent role:`,
      ...(withAnswers.resume.experience[0]?.bullets ?? []).map((b) => `- ${b}`),
      ``,
      `Honesty flags: ${flagsWith.length ? flagsWith.map((f) => `${f.value} (${f.reason})`).join("; ") : "none"}`,
      ``,
      `**Without answers** (summary): ${noAnswers.resume.summary}`,
      ``,
      `Honesty flags: ${flagsWithout.length ? flagsWithout.map((f) => `${f.value} (${f.reason})`).join("; ") : "none"}`,
      ``,
    );
    check("HR case: answers show up in the resume", usedTerms.length === HR_CASE.expectedInResume.length, `${usedTerms.length}/${HR_CASE.expectedInResume.length}`);
    check("HR case: no invented facts with answers", flagsWith.length === 0, `${flagsWith.length} flags`);
    check("HR case: no invented facts without answers", flagsWithout.length === 0, `${flagsWithout.length} flags`);
    check("HR case: without answers, no metrics it was never given", !/30 ימים|45/.test(text(noAnswers)), "");
  }

  const passed = checks.filter((c) => c.ok).length;
  lines.splice(4, 0, `**Checks passed: ${passed}/${checks.length}**`, ``, ...checks.map((c) => `- ${c.ok ? "✅" : "❌"} ${c.name}${c.detail ? ` (${c.detail})` : ""}`), ``);
  const report = lines.join("\n");
  const dir = path.join(process.cwd(), "eval", "results");
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, "latest.md"), report);
  if (process.env.GITHUB_STEP_SUMMARY) writeFileSync(process.env.GITHUB_STEP_SUMMARY, report);
  console.log(report);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
