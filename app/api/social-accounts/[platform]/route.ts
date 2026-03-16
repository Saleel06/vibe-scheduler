import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Platform } from "@prisma/client";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ platform: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { platform } = await params;
  const platformUpper = platform.toUpperCase() as Platform;

  if (!["TWITTER", "LINKEDIN", "INSTAGRAM"].includes(platformUpper)) {
    return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Remove from SocialAccount
    await prisma.socialAccount.deleteMany({
      where: { userId: user.id, platform: platformUpper },
    });

    // Also remove from NextAuth Account so they can re-connect cleanly
    await prisma.account.deleteMany({
      where: { userId: user.id, provider: platform.toLowerCase() },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
