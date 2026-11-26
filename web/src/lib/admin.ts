import "server-only";
import { notFound } from "next/navigation";
import { UserError } from "./errors";
import { normalizeIsraeliMobile } from "./phone";
import { getCurrentUser } from "./session";
import type { User } from "./types";

/** Owners are set with ADMIN_PHONES (comma-separated mobile numbers) in the server environment. */
function adminPhones(): Set<string> {
  return new Set(
    (process.env.ADMIN_PHONES ?? "")
      .split(",")
      .map((p) => normalizeIsraeliMobile(p.trim()))
      .filter((p): p is string => Boolean(p)),
  );
}

export function isAdmin(user: Pick<User, "phone"> | null): boolean {
  return Boolean(user && adminPhones().has(user.phone));
}

/** For pages: anyone else gets a plain 404, so the page's existence isn't revealed. */
export async function requireAdminPage(): Promise<User> {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) notFound();
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) throw new UserError("הפעולה לא נמצאה.", 404);
  return user;
}
