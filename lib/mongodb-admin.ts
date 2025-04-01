import clientPromise from "./mongodb"
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

export async function findOne(collectionName: string, query: any) {
  try {
    const collection = await getCollection(collectionName)
    return collection.findOne(query)
  } catch (error) {
    console.error(`Error finding document in ${collectionName}:`, error)
    throw error
  }
}

export async function findMany(collectionName: string, query: any = {}, options: any = {}) {
  try {
    const collection = await getCollection(collectionName)
    return collection.find(query, options).toArray()
  } catch (error) {
    console.error(`Error finding documents in ${collectionName}:`, error)
    throw error
  }
}

export async function insertOne(collectionName: string, document: any) {
  try {
    const collection = await getCollection(collectionName)
    return collection.insertOne(document)
  } catch (error) {
    console.error(`Error inserting document into ${collectionName}:`, error)
    throw error
  }
}

export async function updateOne(collectionName: string, filter: any, update: any) {
  try {
    const collection = await getCollection(collectionName)
    return collection.updateOne(filter, update)
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error)
    throw error
  }
}

export async function deleteOne(collectionName: string, filter: any) {
  try {
    const collection = await getCollection(collectionName)
    return collection.deleteOne(filter)
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error)
    throw error
  }
}

export async function countDocuments(collectionName: string, filter: any = {}) {
  try {
    const collection = await getCollection(collectionName)
    return collection.countDocuments(filter)
  } catch (error) {
    console.error(`Error counting documents in ${collectionName}:`, error)
    throw error
  }
}

export async function aggregate(collectionName: string, pipeline: any[]) {
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

