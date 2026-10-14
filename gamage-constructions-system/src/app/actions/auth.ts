// src/app/actions/auth.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function loginOwner(prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please enter both email and password." };
  }

  const user = await prisma.user.findUnique({
    where: { email: email.trim() },
  });

  if (!user) {
    return { error: "Invalid email or credentials." };
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return { error: "Invalid email or credentials." };
  }

  // Set persistent session cookie
  const cookieStore = await cookies();
  cookieStore.set("auth_session", JSON.stringify({ id: user.id, name: user.name, role: user.role }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  redirect("/dashboard");
}

export async function logoutOwner() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_session");
  redirect("/login");
}