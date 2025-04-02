import clientPromise from "./mongodb"
import { ObjectId } from "mongodb"

// Helper functions for common database operations
export async function getCollection(collectionName: string) {
  try {
    const client = await clientPromise
    // Specify the database name here
    const db = client.db("cryptofund_db")
    return db.collection(collectionName)
  } catch (error) {
    console.error(`Error getting collection ${collectionName}:`, error)
    throw new Error(`Database connection error: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function findOne(collectionName: string, query: Record<string, unknown>) {
  try {
    const collection = await getCollection(collectionName)
    return collection.findOne(query)
  } catch (error) {
    console.error(`Error finding document in ${collectionName}:`, error)
    throw error
  }
}

export async function findMany(
  collectionName: string,
  query: Record<string, unknown> = {},
  options: Record<string, unknown> = {},
) {
  try {
    const collection = await getCollection(collectionName)
    return collection.find(query, options).toArray()
  } catch (error) {
    console.error(`Error finding documents in ${collectionName}:`, error)
    throw error
  }
}

export async function insertOne(collectionName: string, document: Record<string, unknown>) {
  try {
    const collection = await getCollection(collectionName)
    return collection.insertOne(document)
  } catch (error) {
    console.error(`Error inserting document into ${collectionName}:`, error)
    throw error
  }
}

export async function updateOne(
  collectionName: string,
  filter: Record<string, unknown>,
  update: Record<string, unknown>,
) {
  try {
    const collection = await getCollection(collectionName)
    return collection.updateOne(filter, update)
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error)
    throw error
  }
}

export async function deleteOne(collectionName: string, filter: Record<string, unknown>) {
  try {
    const collection = await getCollection(collectionName)
    return collection.deleteOne(filter)
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error)
    throw error
  }
}

export async function countDocuments(collectionName: string, filter: Record<string, unknown> = {}) {
  try {
    const collection = await getCollection(collectionName)
    return collection.countDocuments(filter)
  } catch (error) {
    console.error(`Error counting documents in ${collectionName}:`, error)
    throw error
  }
}

import { Document } from "mongodb";

export async function aggregate(collectionName: string, pipeline: Document[]) {
  try {
    const collection = await getCollection(collectionName)
    return collection.aggregate(pipeline).toArray()
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