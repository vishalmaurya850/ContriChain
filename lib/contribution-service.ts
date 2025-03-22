import { db } from "@/lib/firebase"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  runTransaction,
  DocumentData,
  DocumentSnapshot,
} from "firebase/firestore"

export interface Contribution {
  id: string
  campaignId: string
  userId: string
  userName: string
  userImage?: string
  amount: number
  transactionHash: string
  timestamp: any
}

export async function createContribution(data: {
  campaignId: string
  userId: string
  amount: number
  transactionHash: string
}) {
  try {
    const userRef = doc(db, "users", data.userId)
    const campaignRef = doc(db, "campaigns", data.campaignId)

    // Use transaction to update campaign raised amount
    await runTransaction(db, async (transaction) => {
      const campaignDoc = await transaction.get(campaignRef)

      if (!campaignDoc.exists()) {
        throw new Error("Campaign does not exist")
      }

      const currentRaised = campaignDoc.data().raised || 0
      const newRaised = currentRaised + data.amount

      transaction.update(campaignRef, { raised: newRaised })

      // Add contribution
      const contributionRef = doc(collection(db, "contributions"))
      transaction.set(contributionRef, {
        campaignRef,
        userRef,
        amount: data.amount,
        transactionHash: data.transactionHash,
        timestamp: serverTimestamp(),
      })
    })

    // Get user data for return value
    interface User {
      name: string
      image?: string
    }
    const userConverter = {
      toFirestore(user: User): DocumentData {
        return { name: user.name, image: user.image };
      },
      fromFirestore(snapshot: DocumentSnapshot): User {
        const data = snapshot.data();
        return { name: data?.name ?? "Unknown", image: data?.image };
      },
    };

    const userDoc = await getDoc(userRef.withConverter(userConverter));

    const contribution: Contribution = {
      id: "new-contribution-id", // This would be the actual ID in a real implementation
      campaignId: data.campaignId,
      userId: data.userId,
      userName: userDoc.data()?.name ?? "Unknown",
      userImage: (userDoc.data() as { image?: string }).image,
      amount: data.amount,
      transactionHash: data.transactionHash,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("Error creating contribution:", error)
    throw error
  }
}

export async function getCampaignContributions(campaignId: string) {
  try {
    const campaignRef = doc(db, "campaigns", campaignId)

    const contributionsQuery = query(
      collection(db, "contributions"),
      where("campaignRef", "==", campaignRef),
      orderBy("timestamp", "desc"),
    )

    const snapshot = await getDocs(contributionsQuery)

    const contributions: Contribution[] = []

    for (const doc of snapshot.docs) {
      const data = doc.data()

      // Get user data
      const userConverter = {
        toFirestore(user: { name: string; image?: string }): DocumentData {
          return { name: user.name, image: user.image };
        },
        fromFirestore(snapshot: DocumentSnapshot<DocumentData>): { name: string; image?: string } {
          const data = snapshot.data() as { name?: string; image?: string };
          return { name: data?.name ?? "Unknown", image: data?.image };
        },
      };

      const userDoc = await getDoc(data.userRef.withConverter(userConverter)) as DocumentSnapshot<{ name?: string; image?: string }>;

      contributions.push({
        id: doc.id,
        campaignId,
        userId: userDoc.id,
        userName: (userDoc.data() as { name?: string }).name || "Unknown",
        userImage: userDoc.data()?.image,
        amount: data.amount,
        transactionHash: data.transactionHash,
        timestamp: data.timestamp?.toDate(),
      })
    }

    return contributions
  } catch (error) {
    console.error("Error getting campaign contributions:", error)
    throw error
  }
}

export async function getUserContributions(userId: string) {
  try {
    const userRef = doc(db, "users", userId)

    const contributionsQuery = query(
      collection(db, "contributions"),
      where("userRef", "==", userRef),
      orderBy("timestamp", "desc"),
    )

    const snapshot = await getDocs(contributionsQuery)

    const contributions: Contribution[] = []

    for (const doc of snapshot.docs) {
      const data = doc.data()

      // Get campaign data
      const campaignDoc = await getDoc(data.campaignRef)

      contributions.push({
        id: doc.id,
        campaignId: campaignDoc.id,
        userId,
        userName: "", // Not needed for user's own contributions
        amount: data.amount,
        transactionHash: data.transactionHash,
        timestamp: data.timestamp?.toDate(),
      })
    }

    return contributions
  } catch (error) {
    console.error("Error getting user contributions:", error)
    throw error
  }
}

