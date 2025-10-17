import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // 1) Get OAuth2 access token via /token (form-encoded)
        const tokenRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/token`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            username: credentials.email,
            password: credentials.password,
          }),
        });

        if (!tokenRes.ok) return null;
        const tokenJson = await tokenRes.json();
        const accessToken: string | undefined = tokenJson?.access_token;

        if (!accessToken) return null;

        // 2) Fetch user info from /me using the bearer token
        const meRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
        });

        if (!meRes.ok) return null;
        const me = await meRes.json();

        // 3) Return the user object; keep token to persist in JWT
        return {
          id: String(me.id),
          name: me.name,
          email: me.email,
          accessToken, // will be copied into JWT in callbacks.jwt
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.email = user.email as string;
        token.name = user.name as string;
        token.accessToken = (user as any).accessToken as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      // @ts-expect-error - expose backend token for client/API calls
      session.accessToken = (token as any).accessToken as string | undefined;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
