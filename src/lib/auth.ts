import NextAuth, { type NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { rateLimit } from "./rate-limit";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email.toLowerCase();
        const ip =
          (req?.headers?.["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
          "unknown";
        // Dois balde: por email (proteção da conta) e por IP (proteção do servidor).
        const byEmail = rateLimit(`login:email:${email}`, {
          max: 5,
          windowMs: 15 * 60_000,
          blockMs: 15 * 60_000,
        });
        const byIp = rateLimit(`login:ip:${ip}`, {
          max: 20,
          windowMs: 15 * 60_000,
          blockMs: 30 * 60_000,
        });
        if (!byEmail.ok || !byIp.ok) return null;
        const user = await db.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;
        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const auth = () => getServerSession(authOptions);

export async function requireUser() {
  const session = await auth();
  if (!session?.user) throw new Error("UNAUTHENTICATED");
  return session.user as { id: string; email: string; name: string; role: "USER" | "ADMIN" };
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return user;
}

export async function hashPassword(pwd: string) {
  return bcrypt.hash(pwd, 12);
}
