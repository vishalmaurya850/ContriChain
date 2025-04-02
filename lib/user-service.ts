import { findOne, updateOne, insertOne, createObjectId } from "@/lib/mongodb-admin"
import type { User } from "./models/types"

export async function getUserById(id: string): Promise<User | null> {
  try {
    const user = await findOne("users", { _id: createObjectId(id) })

    if (!user) {
      return null
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      _id: undefined,
      password: undefined, // Don't return password
    } as User
  } catch (error) {
    console.error("Error getting user:", error)
    throw error
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const user = await findOne("users", { email: email.toLowerCase() })

    if (!user) {
      return null
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      _id: undefined,
      password: undefined, // Don't return password
    } as User
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
    const user = {
      name: data.name,
      email: data.email.toLowerCase(),
      image: data.image,
      isAdmin: false,
      createdAt: new Date(),
    }

    const result = await insertOne("users", user)

    return {
      id: result.insertedId.toString(),
      ...user,
    } as User
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

export async function updateUserWallet(userId: string, walletAddress: string): Promise<boolean> {
  try {
    const result = await updateOne(
      "users",
      { _id: createObjectId(userId) },
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
  data: Partial<Omit<User, "id" | "createdAt">>,
): Promise<boolean> {
  try {
    const result = await updateOne(
      "users",
      { _id: createObjectId(userId) },
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