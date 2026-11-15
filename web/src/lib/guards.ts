import "server-only";
import { getCurrentUser } from "./session";
import { getEntitlement } from "./billing";
import { UserError } from "./errors";

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new UserError("צריך להתחבר כדי להמשיך.", 401);
  return user;
}

export async function requireActivePlan() {
  const user = await requireUser();
  const ent = await getEntitlement(user.id);
  if (!ent.active) throw new UserError("הפעולה הזו זמינה למנויים. אפשר להתחיל בשבוע היכרות.", 402);
  return { user, ent };
}
