import clientPromise from "./mongodb"
import { Document, InsertOneResult } from "mongodb";
import { ObjectId, AggregationCursor } from "mongodb"

// Helper functions for common database operations
export async function getCollection(collectionName: string) {
  try {
    const client = await clientPromise
    if (!client) {
      throw new Error("Database client is undefined");
    }
    const db = client.db()
    return db.collection(collectionName)
  } catch (error) {
    console.error(`Error getting collection ${collectionName}:`, error)
    throw new Error(`Database connection error: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function findOne<T>(collectionName: string, query: Partial<T>) {
  try {
    const collection = await getCollection(collectionName)
    return collection.findOne(query)
  } catch (error) {
    console.error(`Error finding document in ${collectionName}:`, error)
    throw error
  }
}

export async function findMany<T>(collectionName: string, query: Partial<T> = {}, options: Record<string, unknown> = {}) {
  try {
    const collection = await getCollection(collectionName)
    return collection.find(query, options).toArray()
  } catch (error) {
    console.error(`Error finding documents in ${collectionName}:`, error)
    throw error
  }
}

export async function insertOne<T extends Document>(collectionName: string, document: T,): Promise<InsertOneResult<T>> {
  try {
    const collection = await getCollection(collectionName)
    return collection.insertOne(document)
  } catch (error) {
    console.error(`Error inserting document into ${collectionName}:`, error)
    throw error
  }
}

export async function updateOne<T>(collectionName: string, filter: Partial<T>, update: Partial<T> | Record<string, unknown>) {
  try {
    const collection = await getCollection(collectionName)
    return collection.updateOne(filter, update)
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error)
    throw error
  }
}

export async function deleteOne<T>(collectionName: string, filter: Partial<T>) {
  try {
    const collection = await getCollection(collectionName)
    return collection.deleteOne(filter)
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error)
    throw error
  }
}

export async function countDocuments<T>(collectionName: string, filter: Partial<T> = {}) {
  try {
    const collection = await getCollection(collectionName)
    return collection.countDocuments(filter)
  } catch (error) {
    console.error(`Error counting documents in ${collectionName}:`, error)
    throw error
  }
}

export async function aggregate(collectionName: string, pipeline: Record<string, unknown>[]) {
  try {
    const collection = await getCollection(collectionName)
    const cursor = await collection.aggregate(pipeline) as AggregationCursor<Document>
    return cursor.toArray()
  } catch (error) {
    console.error(`Error aggregating documents in ${collectionName}:`, error)
    throw error
  }
}

export function createObjectId(id: string) {
  try {
    return new ObjectId(id)
  } catch (error) {
    console.error(`Error creating ObjectId:`, error)
    throw error
  }
}

