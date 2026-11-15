import "server-only";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { UserError } from "./errors";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_TEXT_CHARS = 20_000;

export type JobInput =
  | { kind: "text"; text: string; sourceUrl?: string }
  | { kind: "image"; data: string; mediaType: "image/png" | "image/jpeg" | "image/webp" };

function clean(text: string): string {
  return text
    .replace(/\u0000/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, MAX_TEXT_CHARS);
}

function extOf(name: string) {
  return name.toLowerCase().split(".").pop() ?? "";
}

async function fileText(file: File, what: string): Promise<string> {
  if (file.size > MAX_FILE_BYTES) throw new UserError(`הקובץ של ${what} גדול מ-5MB.`);
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = extOf(file.name);
  if (ext === "pdf" || file.type === "application/pdf") {
    const { extractText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(buf));
    const { text } = await extractText(pdf, { mergePages: true });
    return clean(Array.isArray(text) ? text.join("\n") : text);
  }
  if (ext === "docx") {
    const mammoth = await import("mammoth");
    const { value } = await mammoth.extractRawText({ buffer: buf });
    return clean(value);
  }
  if (ext === "txt") return clean(buf.toString("utf8"));
  throw new UserError(`אפשר להעלות ${what} כקובץ PDF או Word (DOCX).`);
}

export async function extractResumeText(file: File | null): Promise<string> {
  if (!file || file.size === 0) throw new UserError("צריך להעלות קובץ קורות חיים.");
  const text = await fileText(file, "קורות החיים");
  if (text.length < 200) {
    throw new UserError(
      "לא הצלחנו לקרוא מספיק טקסט מקורות החיים. אם זה PDF סרוק (תמונה), נסו לשמור אותו מחדש מ-Word או להעלות DOCX.",
    );
  }
  return text;
}

function isPrivateAddress(ip: string): boolean {
  if (ip.includes(":")) {
    const v = ip.toLowerCase();
    return v === "::1" || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80") || v.startsWith("::ffff:");
  }
  const [a, b] = ip.split(".").map(Number);
  return (
    a === 10 ||
    a === 127 ||
    a === 0 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127)
  );
}

async function assertPublicUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new UserError("הקישור למשרה לא תקין.");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new UserError("הקישור למשרה לא תקין.");
  const host = url.hostname.replace(/^\[|\]$/g, "");
  const addresses = isIP(host) ? [host] : (await lookup(host, { all: true }).catch(() => [])).map((a) => a.address);
  if (addresses.length === 0 || addresses.some(isPrivateAddress)) {
    throw new UserError("לא הצלחנו לפתוח את הקישור. נסו להדביק את טקסט המשרה.");
  }
  return url;
}

async function fetchJobPage(raw: string): Promise<string> {
  const blocked = "האתר של המשרה לא מאפשר קריאה אוטומטית. הדביקו את טקסט המשרה או העלו צילום מסך.";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  let html: string;
  try {
    // Follow redirects by hand so every hop is checked against private addresses.
    let url = await assertPublicUrl(raw);
    let res: Response | null = null;
    for (let hop = 0; hop < 4; hop++) {
      res = await fetch(url, {
        signal: controller.signal,
        redirect: "manual",
        headers: { "User-Agent": "Mozilla/5.0 (compatible; JobFitBot/1.0)", Accept: "text/html" },
      });
      const location = res.headers.get("location");
      if (res.status >= 300 && res.status < 400 && location) {
        url = await assertPublicUrl(new URL(location, url).toString());
        continue;
      }
      break;
    }
    if (!res || !res.ok) throw new UserError(blocked);
    html = (await res.text()).slice(0, 2_000_000);
  } catch (err) {
    if (err instanceof UserError) throw err;
    throw new UserError(blocked);
  } finally {
    clearTimeout(timer);
  }

  const cheerio = await import("cheerio");
  const $ = cheerio.load(html);
  $("script, style, noscript, svg, nav, footer, header, form, iframe").remove();
  const main = $("main").text() || $("article").text() || $("body").text();
  const text = clean(main);
  if (text.length < 200) {
    throw new UserError("לא מצאנו את תוכן המשרה בעמוד. הדביקו את טקסט המשרה או העלו צילום מסך.");
  }
  return text;
}

export async function extractJob(input: { text?: string; url?: string; file?: File | null }): Promise<JobInput> {
  if (input.text && input.text.trim().length > 0) {
    const text = clean(input.text);
    if (text.length < 80) throw new UserError("טקסט המשרה קצר מדי. הדביקו את המודעה המלאה.");
    return { kind: "text", text };
  }
  if (input.url && input.url.trim()) {
    return { kind: "text", text: await fetchJobPage(input.url), sourceUrl: input.url.trim() };
  }
  const file = input.file;
  if (file && file.size > 0) {
    const ext = extOf(file.name);
    if (["png", "jpg", "jpeg", "webp"].includes(ext)) {
      if (file.size > MAX_FILE_BYTES) throw new UserError("התמונה גדולה מ-5MB.");
      const mediaType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
      return { kind: "image", data: Buffer.from(await file.arrayBuffer()).toString("base64"), mediaType };
    }
    return { kind: "text", text: await fileText(file, "המשרה") };
  }
  throw new UserError("צריך להוסיף את המשרה: קישור, טקסט, קובץ או צילום מסך.");
}
