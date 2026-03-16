import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function verifyState(state: string): { email: string } | null {
  const [payload, sig] = state.split(".");
  if (!payload || !sig) return null;

  const expected = crypto
    .createHmac("sha256", process.env.NEXTAUTH_SECRET!)
    .update(payload)
    .digest("base64url");

  if (sig !== expected) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    // Reject states older than 10 minutes
    if (Date.now() - data.ts > 10 * 60 * 1000) return null;
    return data;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const base = new URL("/dashboard/settings", req.url);

  const error = searchParams.get("error");
  if (error) {
    base.searchParams.set("error", "linkedin_denied");
    return NextResponse.redirect(base.toString());
  }

  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) {
    base.searchParams.set("error", "missing_params");
    return NextResponse.redirect(base.toString());
  }

  // Verify state signature
  const stateData = verifyState(state);
  if (!stateData) {
    base.searchParams.set("error", "invalid_state");
    return NextResponse.redirect(base.toString());
  }

  // Exchange code for access token
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/linkedin/callback`;

  const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
    }),
  });

  const tokens = await tokenRes.json();

  if (!tokens.access_token) {
    console.error("LinkedIn token exchange failed:", tokens);
    base.searchParams.set("error", "token_failed");
    return NextResponse.redirect(base.toString());
  }

  // Fetch LinkedIn profile via OpenID Connect userinfo
  const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  const profile = await profileRes.json();

  if (!profile.sub) {
    base.searchParams.set("error", "profile_failed");
    return NextResponse.redirect(base.toString());
  }

  // Find the user by the email stored in state
  const user = await prisma.user.findUnique({ where: { email: stateData.email } });
  if (!user) {
    base.searchParams.set("error", "user_not_found");
    return NextResponse.redirect(base.toString());
  }

  // Upsert SocialAccount
  await prisma.socialAccount.upsert({
    where: {
      userId_platform_accountId: {
        userId: user.id,
        platform: "LINKEDIN",
        accountId: profile.sub,
      },
    },
    create: {
      userId: user.id,
      platform: "LINKEDIN",
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? null,
      accountName: profile.name ?? "LinkedIn User",
      accountId: profile.sub,
    },
    update: {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? null,
      accountName: profile.name ?? "LinkedIn User",
    },
  });

  base.searchParams.set("connected", "linkedin");
  return NextResponse.redirect(base.toString());
}
