import "server-only";
import { UserError } from "@/lib/errors";

/**
 * Renders one of our own print pages to an A4 PDF with headless Chromium, so the
 * user gets a real file download instead of the browser's print dialog.
 *
 * - On Vercel / Linux servers we use @sparticuz/chromium (a serverless build).
 * - Locally, set CHROME_PATH to an installed Chrome / Edge to test.
 *
 * Safety: the browser only ever opens a fixed path on our own origin, carrying the
 * caller's own cookies, and every request to another origin is blocked.
 */
export async function renderPrintPagePdf(opts: { origin: string; path: string; cookie: string; authorization?: string | null }) {
  const puppeteer = (await import("puppeteer-core")).default;
  const localChrome = process.env.CHROME_PATH;

  let browser: Awaited<ReturnType<typeof puppeteer.launch>>;
  try {
    if (localChrome) {
      browser = await puppeteer.launch({ executablePath: localChrome, headless: true, args: ["--no-sandbox"] });
    } else {
      const chromium = (await import("@sparticuz/chromium")).default;
      chromium.setGraphicsMode = false;
      browser = await puppeteer.launch({
        args: await puppeteer.defaultArgs({ args: chromium.args, headless: "shell" }),
        executablePath: await chromium.executablePath(),
        headless: "shell",
      });
    }
  } catch (err) {
    console.error("pdf: browser launch failed", err);
    throw new UserError("לא הצלחנו להכין את קובץ ה-PDF כרגע. נסו שוב בעוד רגע, או השתמשו בכפתור ההדפסה. (PDF-LAUNCH)", 503);
  }

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1000, height: 1400, deviceScaleFactor: 1 });
    const headers: Record<string, string> = { cookie: opts.cookie };
    if (opts.authorization) headers.authorization = opts.authorization;

    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const sameOrigin = req.url().startsWith(`${opts.origin}/`);
      if (!sameOrigin && !req.url().startsWith("data:")) return void req.abort();
      void req.continue({ headers: { ...req.headers(), ...headers } });
    });

    const res = await page.goto(`${opts.origin}${opts.path}`, { waitUntil: "networkidle0", timeout: 30_000 });
    if (!res || !res.ok()) {
      console.error("pdf: print page returned", res?.status());
      throw new UserError("לא הצלחנו להכין את קובץ ה-PDF. רעננו את הדף ונסו שוב. (PDF-PAGE)", 502);
    }
    // The print page shrinks the resume to fit one page when it is a bit too long.
    await page.waitForSelector("body[data-fit-ready]", { timeout: 8_000 }).catch(() => undefined);

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    return pdf;
  } catch (err) {
    if (err instanceof UserError) throw err;
    console.error("pdf: render failed", err);
    throw new UserError("לא הצלחנו להכין את קובץ ה-PDF כרגע. נסו שוב בעוד רגע. (PDF-RENDER)", 503);
  } finally {
    await browser.close().catch(() => undefined);
  }
}

/** Safe file name for Content-Disposition, keeping Hebrew. */
export function pdfFileName(text: string) {
  return (
    text
      .replace(/[\\/]/g, "")
      .replace(/[:*?"<>|]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80) || "resume"
  );
}

export function pdfResponse(pdf: Uint8Array, name: string) {
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="resume.pdf"; filename*=UTF-8''${encodeURIComponent(`${name}.pdf`)}`,
      "Cache-Control": "no-store",
    },
  });
}
