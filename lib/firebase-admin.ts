import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

// Check if Firebase Admin is already initialized
const apps = getApps()

// Initialize Firebase Admin if not already initialized
if (!apps.length) {
  // Check if we have the service account credentials
  if (!process.env.FIREBASE_ADMIN_CREDENTIALS) {
    console.error("FIREBASE_ADMIN_CREDENTIALS environment variable is not set")
    // Initialize with a default app configuration for development
    initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    })
  } else {
    try {
      // Try to parse the credentials
      let serviceAccount
      try {
        serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_ADMIN_CREDENTIALS, "base64").toString())
      } catch (parseError) {
        console.error("Error parsing FIREBASE_ADMIN_CREDENTIALS:", parseError)
        console.error("Make sure the credentials are properly formatted and base64 encoded")
        // Initialize with a default app configuration for development
        initializeApp({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        })
        // Exit the current block to avoid the nested try/catch
        // Skip further initialization
        process.exit(1);
      }

      initializeApp({
        credential: cert(serviceAccount),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      })
    } catch (error) {
      console.error("Error initializing Firebase Admin:", error)
      // Initialize with a default app configuration for development
      initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      })
    }
  }
}

// Export the Firebase Admin services
export const adminAuth = getAuth()
export const adminFirestore = getFirestore()