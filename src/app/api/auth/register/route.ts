import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(10),
  name: z.string().min(2).max(120).optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (exists) return NextResponse.json({ error: "Email bestaat al." }, { status: 409 });

  const passwordHash = await hash(parsed.data.password, 12);
  await prisma.user.create({
    data: {
      email: parsed.data.email,
      passwordHash,
      name: parsed.data.name,
      preferredLanguage: "nl",
    },
  });

  return NextResponse.json({ ok: true });
}
