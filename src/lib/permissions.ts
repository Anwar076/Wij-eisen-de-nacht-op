import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function requireRole(roles: string[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.role || !roles.includes(session.user.role)) {
    throw new Error("FORBIDDEN");
  }
  return session.user;
}
