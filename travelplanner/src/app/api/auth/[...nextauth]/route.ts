import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";

console.log("🔍 REGISTER - Initial users:", db.users);
console.log("🔍 REGISTER - Array memory location:", db.users);

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("🔐 Login attempt for email:", credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing credentials");
          return null;
        }

        // Find user by email
        const user = db.users.find((user) => user.email === credentials.email);
        console.log("👤 Found user:", user);
        console.log("📋 All users in db:", db.users);
        
        // Check if user exists and password matches
        if (user && user.password === credentials.password) {
          console.log("✅ Login successful for user:", user.email);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        }

        console.log("❌ Login failed - user not found or password mismatch");
        console.log("🔍 Expected password:", user?.password);
        console.log("🔍 Provided password:", credentials.password);
        console.log("🔍 Password match:", user?.password === credentials.password);
        return null;
      }
    })
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
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };