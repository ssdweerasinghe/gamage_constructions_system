import { cookies } from "next/headers";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "ADMIN";
}

export async function getCurrentUser(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    return JSON.parse(sessionCookie.value) as UserSession;
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<UserSession> {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized: Administrative privileges required.");
  }
  return user;
}