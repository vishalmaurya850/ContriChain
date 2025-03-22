import { db } from "@/lib/firebase"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
 DocumentData, DocumentReference } from "firebase/firestore"

export interface Campaign {
  id: string
  title: string
  description: string
  goal: number
  raised: number
  deadline: number
  userId: string
  userName: string
  userImage?: string
  imageUrl?: string
  status: "active" | "paused" | "completed"
  category: string
  createdAt: any
  updatedAt: any
  onChainId: string
  transactionHash: string
}

export async function getAllCampaigns(options?: {
  category?: string
  status?: string
  limit?: number
}) {
  try {
    let campaignsQuery = query(collection(db, "campaigns"), orderBy("createdAt", "desc"))

    if (options?.category) {
      campaignsQuery = query(campaignsQuery, where("category", "==", options.category))
    }

    if (options?.status) {
      campaignsQuery = query(campaignsQuery, where("status", "==", options.status))
    }

    if (options?.limit) {
      campaignsQuery = query(campaignsQuery, limit(options.limit))
    }

    const snapshot = await getDocs(campaignsQuery)

    const campaigns: Campaign[] = []

    for (const doc of snapshot.docs) {
      const data = doc.data()

      // Get user data
      const userDoc = await getDoc(data.userRef as DocumentReference<{ name: string; image?: string }>)

      campaigns.push({
        id: doc.id,
        ...data,
        userId: userDoc.id,
        userName: userDoc.data()?.name || "Unknown",
        userImage: userDoc.data()?.image ?? undefined,
      } as Campaign)
    }

    return campaigns
  } catch (error) {
    console.error("Error getting campaigns:", error)
    throw error
  }
}

export async function getCampaignById(id: string) {
  try {
    const docRef = doc(db, "campaigns", id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return null
    }

    const data = docSnap.data()

    // Get user data
    const userDoc = await getDoc(data.userRef as DocumentReference<{ name: string; image?: string }>)

    return {
      id: docSnap.id,
      ...data,
      userId: userDoc.id,
      userName: userDoc.data()?.name ?? "Unknown",
      userImage: userDoc.data()?.image ?? undefined,
    } as Campaign
  } catch (error) {
    console.error("Error getting campaign:", error)
    throw error
  }
}

export async function createCampaign(data: {
  title: string
  description: string
  goal: number
  duration: number
  category: string
  userId: string
  imageUrl?: string
  onChainId: string
  transactionHash: string
}) {
  try {
    const userRef = doc(db, "users", data.userId)

    // Calculate deadline
    const deadline = Math.floor(Date.now() / 1000) + data.duration * 24 * 60 * 60

    const docRef = await addDoc(collection(db, "campaigns"), {
      title: data.title,
      description: data.description,
      goal: data.goal,
      raised: 0,
      deadline,
      userRef,
      imageUrl: data.imageUrl,
      status: "active",
      category: data.category,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      onChainId: data.onChainId,
      transactionHash: data.transactionHash,
    })

    return {
      id: docRef.id,
      ...data,
      raised: 0,
      deadline,
      userId: data.userId,
      userName: "Unknown", // Default value for userName
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Campaign
  } catch (error) {
    console.error("Error creating campaign:", error)
    throw error
  }
}

export async function updateCampaign(
  id: string,
  data: Partial<Omit<Campaign, "id" | "userId" | "createdAt" | "updatedAt">>,
) {
  try {
    const docRef = doc(db, "campaigns", id)

    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    })

    return {
      id,
      ...data,
    }
  } catch (error) {
    console.error("Error updating campaign:", error)
    throw error
  }
}

export async function deleteCampaign(id: string) {
  try {
    const docRef = doc(db, "campaigns", id)
    await deleteDoc(docRef)
  } catch (error) {
    console.error("Error deleting campaign:", error)
    throw error
  }
}

export async function getUserCampaigns(userId: string) {
  try {
    const userRef = doc(db, "users", userId)

    const campaignsQuery = query(
      collection(db, "campaigns"),
      where("userRef", "==", userRef),
      orderBy("createdAt", "desc"),
    )

    const snapshot = await getDocs(campaignsQuery)

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      userId,
    })) as Campaign[]
  } catch (error) {
    console.error("Error getting user campaigns:", error)
    throw error
  }
}

