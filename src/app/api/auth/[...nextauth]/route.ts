import { loadEnvConfig } from '@next/env'

import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
loadEnvConfig(process.cwd())

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    signIn: async ({ user, account, profile }) => {
      // Check if the email ends with @illinois.edu
      if (user.email?.endsWith('@illinois.edu')) {
        return true
      }
      // Return false to display a default error message
      return false
    },
    session: async ({ session, user }) => {
      if (session?.user && typeof user.id === 'string') {
        (session.user as any).id = user.id
      }
      return session
    },
    redirect: async ({ url, baseUrl }) => {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  pages: {
    error: '/auth/error', // Custom error page
    signIn: '/',
  },
})

export { handler as GET, handler as POST } 