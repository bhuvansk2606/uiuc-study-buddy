import { loadEnvConfig } from '@next/env'

import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { authOptions } from "@/lib/auth"
loadEnvConfig(process.cwd())

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST } 