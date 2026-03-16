import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import LinkedInProvider from "next-auth/providers/linkedin";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID ?? "",
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET ?? "",
      authorization: {
        params: { scope: "openid profile email w_member_social" },
      },
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // When LinkedIn OAuth completes, persist to SocialAccount table
      if (account?.provider === "linkedin" && account.access_token && user.id) {
        try {
          await prisma.socialAccount.upsert({
            where: {
              userId_platform_accountId: {
                userId: user.id,
                platform: "LINKEDIN",
                accountId: account.providerAccountId,
              },
            },
            create: {
              userId: user.id,
              platform: "LINKEDIN",
              accessToken: account.access_token,
              refreshToken: account.refresh_token ?? null,
              accountName: user.name ?? "LinkedIn User",
              accountId: account.providerAccountId,
            },
            update: {
              accessToken: account.access_token,
              refreshToken: account.refresh_token ?? null,
              accountName: user.name ?? "LinkedIn User",
            },
          });
        } catch (err) {
          console.error("Failed to save LinkedIn social account:", err);
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
};
