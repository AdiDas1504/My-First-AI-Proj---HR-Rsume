import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { getCurrentUser } from "@/lib/session";
import { safeNext } from "@/lib/safe-next";

export const metadata: Metadata = { title: "כניסה" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  if (await getCurrentUser()) redirect(next);
  return (
    <div className="container-page grid min-h-[70vh] items-center py-14">
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-4xl">כניסה ל-JobFit</h1>
        <p className="mt-3 mb-8 text-lg text-muted">בלי סיסמה. מקלידים מספר נייד ומקבלים קוד ב-SMS.</p>
        <LoginForm next={next} />
      </div>
    </div>
  );
}
