import { MongoClient, ObjectId, ServerApiVersion } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env.local")
}

const uri = process.env.MONGODB_URI
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof global & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise

export interface CustomDocument {
    _id: ObjectId
    [key: string]: unknown // Allow additional properties
  }

// Helper functions for common database operations
export async function getCollection(collectionName: string) {
  const client = await clientPromise
  const db = client.db()
  return db.collection(collectionName)
}

export async function findOne<T>(collectionName: string, query: Partial<T>) {
  const collection = await getCollection(collectionName)
  return collection.findOne(query)
}

export async function findMany<T>(collectionName: string, query: Partial<T> = {}, options: Record<string, unknown> = {}) {
  const collection = await getCollection(collectionName)
  return collection.find(query, options).toArray()
}

export async function insertOne<T extends Document>(collectionName: string, document: T) {
  const collection = await getCollection(collectionName)
  return collection.insertOne(document)
}

export async function updateOne<T>(collectionName: string, filter: Partial<T>, update: Record<string, unknown>): Promise<unknown> {
  const collection = await getCollection(collectionName)
  return collection.updateOne(filter, update)
}

export async function deleteOne<T>(collectionName: string, filter: Partial<T>) {
  const collection = await getCollection(collectionName)
  return collection.deleteOne(filter)
}

export async function countDocuments<T>(collectionName: string, filter: Partial<T> = {}) {
  const collection = await getCollection(collectionName)
  return collection.countDocuments(filter)
}

export async function aggregate(collectionName: string, pipeline: Record<string, unknown>[]) {
  const collection = await getCollection(collectionName)
  return collection.aggregate(pipeline).toArray()
}

export function createObjectId(id: string) {
  return new ObjectId(id)
}