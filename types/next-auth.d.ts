// Add this file to extend the NextAuth types
import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      isAdmin: boolean
      walletAddress?: string | null
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    isAdmin: boolean
    walletAddress?: string | null
  }
}