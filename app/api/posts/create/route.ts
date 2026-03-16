import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Platform, PostStatus } from "@prisma/client";
import { postToLinkedIn } from "@/lib/linkedin";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { content, platforms, status, publishedAt, images } = await req.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { socialAccounts: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const postStatus: PostStatus = (status as PostStatus) ?? "DRAFT";
    const platformList: Platform[] = Array.isArray(platforms) ? (platforms as Platform[]) : [];

    // Save post to DB first
    const post = await prisma.post.create({
      data: {
        userId: user.id,
        content,
        mediaUrls: [],
        platforms: platformList,
        status: postStatus,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
      },
    });

    // If posting now, push to each connected platform
    if (postStatus === "PUBLISHED") {
      const errors: string[] = [];

      for (const platform of platformList) {
        if (platform === "LINKEDIN") {
          const account = user.socialAccounts.find((a) => a.platform === "LINKEDIN");
          if (!account) {
            errors.push("LinkedIn account not connected — go to Settings to connect it.");
            continue;
          }
          try {
            await postToLinkedIn(account.accessToken, account.accountId, content, images ?? []);
          } catch (err) {
            errors.push(`LinkedIn posting failed: ${err instanceof Error ? err.message : String(err)}`);
            // Mark post as FAILED
            await prisma.post.update({
              where: { id: post.id },
              data: { status: "FAILED" },
            });
          }
        }
        // Twitter / Instagram: not yet supported
      }

      if (errors.length > 0) {
        return NextResponse.json(
          { ...post, warnings: errors },
          { status: 207 } // 207 Multi-Status: saved but some platforms failed
        );
      }
    }

    return NextResponse.json(post, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
