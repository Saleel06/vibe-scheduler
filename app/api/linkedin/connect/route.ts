import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

function buildState(email: string): string {
  const payload = Buffer.from(JSON.stringify({ email, ts: Date.now() })).toString("base64url");
  const sig = crypto
    .createHmac("sha256", process.env.NEXTAUTH_SECRET!)
    .update(payload)
    .digest("base64url");
  return `${payload}.${sig}`;
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  const redirectUri = `${process.env.NEXTAUTH_URL}/api/linkedin/callback`;

  const url = new URL("https://www.linkedin.com/oauth/v2/authorization");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", process.env.LINKEDIN_CLIENT_ID!);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", "openid profile email w_member_social");
  url.searchParams.set("state", buildState(session.user.email));

  return NextResponse.redirect(url.toString());
}
