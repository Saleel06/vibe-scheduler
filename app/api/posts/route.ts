import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PostStatus } from "@prisma/client";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const posts = await prisma.post.findMany({
      where: {
        userId: user.id,
        ...(status ? { status: status as PostStatus } : {}),
      },
      orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }],
    });

    // Put SCHEDULED posts first, then DRAFT, then rest
    const order = ["SCHEDULED", "DRAFT", "PUBLISHED", "FAILED"];
    posts.sort((a, b) => {
      const ai = order.indexOf(a.status);
      const bi = order.indexOf(b.status);
      if (ai !== bi) return ai - bi;
      // Within SCHEDULED: sort by scheduledAt asc
      if (a.status === "SCHEDULED" && a.scheduledAt && b.scheduledAt) {
        return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
      }
      // Within DRAFT: most recent first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json(posts);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
