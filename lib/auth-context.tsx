"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { SessionProvider } from "next-auth/react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { auth } from "@/lib/firebase"

interface AuthContextType {
  firebaseUser: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  loading: true,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ firebaseUser, loading }}>
      <SessionProvider>{children}</SessionProvider>
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}