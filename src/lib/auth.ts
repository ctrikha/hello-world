import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: Role | null;
      orgId: string | null;
      organizations: { orgId: string; role: Role }[];
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY!,
      from: process.env.RESEND_FROM_EMAIL ?? "noreply@example.com",
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        const orgs = await prisma.userOrganization.findMany({
          where: { userId: user.id },
          select: { organizationId: true, role: true },
        });
        token.organizations = orgs.map((o) => ({
          orgId: o.organizationId,
          role: o.role,
        }));
        // Default to first org
        token.orgId = orgs[0]?.organizationId ?? null;
        token.role = orgs[0]?.role ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.userId as string;
      session.user.role = (token.role as Role) ?? null;
      session.user.orgId = (token.orgId as string) ?? null;
      session.user.organizations =
        (token.organizations as { orgId: string; role: Role }[]) ?? [];
      return session;
    },
  },
  pages: {
    signIn: "/login",
    verifyRequest: "/verify",
    error: "/login",
  },
});
