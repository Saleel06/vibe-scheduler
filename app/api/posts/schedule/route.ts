import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { postId, scheduledAt } = await req.json();

    if (!postId || !scheduledAt) {
      return NextResponse.json({ error: "postId and scheduledAt are required" }, { status: 400 });
    }

    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }
    if (scheduledDate <= new Date()) {
      return NextResponse.json({ error: "Scheduled time must be in the future" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const post = await prisma.post.update({
      where: { id: postId, userId: user.id },
      data: {
        scheduledAt: scheduledDate,
        status: "SCHEDULED",
      },
    });

    return NextResponse.json(post);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
