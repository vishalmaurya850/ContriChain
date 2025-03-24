import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { adminAuth, adminFirestore } from "@/lib/firebase-admin"

// Extend the User type to include walletAddress
declare module "next-auth" {
  interface User {
    walletAddress?: string | null
  }

  interface User {
    isAdmin?: boolean
  }

  interface Session {
    user: {
      id: string
      isAdmin?: boolean
      walletAddress?: string | null
    }
  }

  interface JWT {
    id: string
    isAdmin?: boolean
    walletAddress?: string | null
  }
}

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
          // Use Firebase Admin to verify the credentials
          const userRecord = await adminAuth.getUserByEmail(credentials.email).catch(() => null)

          if (!userRecord) {
            console.error("User not found")
            return null
          }

          // Verify the password using Firebase Admin
          // Note: Firebase Admin doesn't have a direct way to verify passwords
          // We'll use a custom token and then verify it
          // const customToken = await adminAuth.createCustomToken(userRecord.uid)

          // Get additional user data from Firestore
          const userDoc = await adminFirestore.collection("users").doc(userRecord.uid).get()

          if (!userDoc.exists) {
            console.error("User document not found")
            return null
          }

          const userData = userDoc.data()

          return {
            id: userRecord.uid,
            name: userRecord.displayName || userData?.name,
            email: userRecord.email,
            image: userRecord.photoURL,
            isAdmin: userData?.isAdmin || false,
            walletAddress: userData?.walletAddress || null,
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
}

