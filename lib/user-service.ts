import clientPromise from "./mongodb"
import { ObjectId } from "mongodb"
import type { User } from "./models/types"

export async function getUserById(id: string): Promise<User | null> {
  try {
    const client = await clientPromise
    const db = client.db()

    const user = await db.collection("users").findOne({ _id: new ObjectId(id) })

    if (!user) {
      return null
    }

    return user as User
  } catch (error) {
    console.error("Error getting user:", error)
    throw error
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const client = await clientPromise
    const db = client.db()

    const user = await db.collection("users").findOne({ email })

    if (!user) {
      return null
    }

    return user as User
  } catch (error) {
    console.error("Error getting user by email:", error)
    throw error
  }
}

export async function createUser(data: {
  name: string
  email: string
  image?: string
}): Promise<User> {
  try {
    const client = await clientPromise
    const db = client.db()

    const user: User = {
      name: data.name,
      email: data.email,
      image: data.image,
      isAdmin: false,
      createdAt: new Date(),
    }

    const result = await db.collection("users").insertOne(user)

    return {
      ...user,
      _id: result.insertedId,
    }
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

export async function updateUserWallet(userId: string, walletAddress: string): Promise<boolean> {
  try {
    const client = await clientPromise
    const db = client.db()

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          walletAddress,
          updatedAt: new Date(),
        },
      },
    )

    return result.modifiedCount === 1
  } catch (error) {
    console.error("Error updating user wallet:", error)
    throw error
  }
}

export async function updateUserProfile(
  userId: string,
  data: Partial<Omit<User, "_id" | "createdAt">>,
): Promise<boolean> {
  try {
    const client = await clientPromise
    const db = client.db()

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          ...data,
          updatedAt: new Date(),
        },
      },
    )

    return result.modifiedCount === 1
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}