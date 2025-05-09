import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("Please provide process.env.NEXTAUTH_SECRET")
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('SignIn callback - Full data:', { user, account, profile })
      if (user.email?.endsWith('@illinois.edu')) {
        return true
      }
      return false
    },
    async session({ session, token }) {
      console.log('Session callback - Full data:', { session, token })
      if (session?.user) {
        session.user.id = token.sub as string
        session.user.name = token.name as string
        session.user.email = token.email as string
      }
      return session
    },
    async jwt({ token, user, account, profile }) {
      console.log('JWT callback - Full data:', { token, user, account, profile })
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
      }
      return token
    }
  },
  pages: {
    error: '/auth/error',
    signIn: '/',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
} 