import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const N8N_USER_URL = process.env.N8N_USER_WEBHOOK!;

async function fetchN8nUser(body: object) {
  const res = await fetch(N8N_USER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  return res.json();
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const { email, password } = credentials as { email: string; password: string };
        const data = await fetchN8nUser({ action: "login", email });
        if (!data.success || !data.user) return null;
        const bcrypt = await import("bcryptjs");
        const valid = await bcrypt.compare(password, data.user.passwordHash || "");
        if (!valid) return null;
        return { id: email, email, name: data.user.name };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.email = user.email; token.name = user.name; }
      return token;
    },
    async session({ session, token }) {
      session.user.email = token.email as string;
      session.user.name = token.name as string;
      return session;
    },
  },
  pages: { signIn: "/auth" },
});
