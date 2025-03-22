import type { NextAuthOptions, User } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

// Extend the User type to include isAdmin and walletAddress
declare module "next-auth" {
  interface User {
    isAdmin?: boolean
    walletAddress?: string | null
  }

  interface Session {
    user: {
      id: string
      isAdmin: boolean
      walletAddress: string | null
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
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
          // Sign in with Firebase Authentication
          const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password)

          const user = userCredential.user

          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, "users", user.uid))

          if (!userDoc.exists()) {
            return null
          }

          const userData = userDoc.data()

          return {
            id: user.uid,
            name: user.displayName || userData.name,
            email: user.email,
            image: user.photoURL,
            isAdmin: userData.isAdmin || false,
            walletAddress: userData.walletAddress || null,
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

