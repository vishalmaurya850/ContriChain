import { db } from "@/lib/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"

export interface User {
  id: string
  name: string
  email: string
  image?: string
  walletAddress?: string
  isAdmin: boolean
  createdAt: any
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(db, "users", id))

    if (!userDoc.exists()) {
      return null
    }

    const userData = userDoc.data()

    return {
      id: userDoc.id,
      name: userData.name,
      email: userData.email,
      image: userData.image,
      walletAddress: userData.walletAddress,
      isAdmin: userData.isAdmin || false,
      createdAt: userData.createdAt?.toDate(),
    }
  } catch (error) {
    console.error("Error getting user:", error)
    throw error
  }
}

export async function updateUserWallet(userId: string, walletAddress: string) {
  try {
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, { walletAddress })
    return true
  } catch (error) {
    console.error("Error updating user wallet:", error)
    throw error
  }
}

export async function updateUserProfile(userId: string, data: Partial<Omit<User, "id" | "createdAt">>) {
  try {
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, data)
    return true
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}

