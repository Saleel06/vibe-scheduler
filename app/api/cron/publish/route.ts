import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { postToLinkedIn } from "@/lib/linkedin";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: Request) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Find all posts due for publishing
  const duePosts = await prisma.post.findMany({
    where: {
      status: "SCHEDULED",
      scheduledAt: { lte: now },
    },
    include: {
      user: {
        include: { socialAccounts: true },
      },
    },
  });

  const results = await Promise.allSettled(
    duePosts.map(async (post) => {
      const linkedInPlatforms = post.platforms.filter((p) => p === "LINKEDIN");

      if (linkedInPlatforms.length === 0) {
        // No supported platform — mark as failed
        await prisma.post.update({
          where: { id: post.id },
          data: { status: "FAILED" },
        });
        return { id: post.id, status: "FAILED", reason: "No supported platform" };
      }

      const linkedInAccount = post.user.socialAccounts.find(
        (a) => a.platform === "LINKEDIN"
      );

      if (!linkedInAccount) {
        await prisma.post.update({
          where: { id: post.id },
          data: { status: "FAILED" },
        });
        return { id: post.id, status: "FAILED", reason: "No LinkedIn account connected" };
      }

      try {
        const platformPostId = await postToLinkedIn(
          linkedInAccount.accessToken,
          linkedInAccount.accountId,
          post.content
        );

        await prisma.post.update({
          where: { id: post.id },
          data: { status: "PUBLISHED", publishedAt: now },
        });

        return { id: post.id, status: "PUBLISHED", platformPostId };
      } catch (err) {
        await prisma.post.update({
          where: { id: post.id },
          data: { status: "FAILED" },
        });
        return { id: post.id, status: "FAILED", reason: String(err) };
      }
    })
  );

  const summary = results.map((r) =>
    r.status === "fulfilled" ? r.value : { status: "ERROR", reason: String(r.reason) }
  );

  return NextResponse.json({ processed: duePosts.length, results: summary });
}
