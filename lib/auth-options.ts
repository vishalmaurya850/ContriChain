import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import clientPromise from "./mongodb"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const client = await clientPromise
          const db = client.db("cryptofund_db")

          // Find user by email
          const user = await db.collection("users").findOne({
            email: credentials.email.toLowerCase(),
          })

          if (!user) {
            console.error("User not found")
            return null
          }

          // Verify password
          const isPasswordValid = await compare(credentials.password, user.password)

          if (!isPasswordValid) {
            console.error("Invalid password")
            return null
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
            isAdmin: user.isAdmin || false,
            walletAddress: user.walletAddress || null,
          }
        } catch (error) {
          console.error("Authentication error:", error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.isAdmin = user.isAdmin
        token.walletAddress = user.walletAddress
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.isAdmin = token.isAdmin as boolean
        session.user.walletAddress = token.walletAddress as string | null
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "development-secret",
  debug: process.env.NODE_ENV === "development",
}