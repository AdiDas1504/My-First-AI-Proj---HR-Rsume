/**
 * Turns a Claude API failure into a short Hebrew message plus a code the site
 * owner can act on. The code is shown to the user ("קוד: ...") so a screenshot
 * is enough to diagnose; full details go to the server log.
 */
export function describeAiError(status: number | undefined, message: string): { status: number; text: string } {
  const m = message.toLowerCase();
  if (m.includes("credit balance") || m.includes("billing")) {
    return { status: 503, text: "שירות ה-AI לא זמין כרגע (אין יתרה בחשבון ה-API). קוד: AI-CREDIT" };
  }
  if (m.includes("usage limit") || m.includes("spend")) {
    return { status: 503, text: "שירות ה-AI לא זמין כרגע (הגענו למגבלת ההוצאה החודשית). קוד: AI-SPEND" };
  }
  switch (status) {
    case 401:
    case 403:
      return { status: 503, text: "חיבור ה-AI לא מוגדר נכון (מפתח API). קוד: AI-401" };
    case 404:
      return { status: 503, text: "מודל ה-AI שהוגדר לא זמין. קוד: AI-404" };
    case 400:
    case 413:
      return { status: 502, text: `בקשת ה-AI נדחתה. נסו שוב ואם זה חוזר, כתבו לנו. קוד: AI-${status}` };
    case 429:
      return { status: 503, text: "הגענו למגבלת הקצב של שירות ה-AI. נסו שוב בעוד דקה. קוד: AI-429" };
    case 529:
    case 500:
    case 502:
    case 503:
      return { status: 503, text: `שירות ה-AI עמוס כרגע. נסו שוב בעוד דקה. קוד: AI-${status}` };
    default:
      if (m.includes("timeout") || m.includes("timed out")) {
        return { status: 504, text: "שירות ה-AI לקח יותר מדי זמן. נסו שוב. קוד: AI-TIMEOUT" };
      }
      return { status: 503, text: `שירות ה-AI לא זמין כרגע. נסו שוב בעוד דקה. קוד: AI-${status ?? "NET"}` };
  }
}
