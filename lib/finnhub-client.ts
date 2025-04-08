import * as finnhub from "finnhub"

// Create a Finnhub API client
const apiKey = process.env.FINNHUB_API_KEY || ""
const finnhubClient = new finnhub.DefaultApi()

// Set the API key if available
if (apiKey) {
  const apiClient = finnhub.ApiClient.instance
  apiClient.authentications["api_key"].apiKey = apiKey
}

// Export the client for use in other modules
export default finnhubClient

// Helper function to check if the client is properly configured
export function isClientConfigured(): boolean {
  return !!apiKey
}

// Helper function to safely make Finnhub API calls with error handling
export async function safeApiCall<T>(
  apiFunction: (callback: (error: Error | null, data: T | null) => void) => void,
): Promise<T> {
  return new Promise((resolve, reject) => {
    try {
      apiFunction((error, data) => {
        if (error) {
          console.error("Finnhub API error:", error)
          reject(error)
          return
        }

        if (!data) {
          reject(new Error("No data received from Finnhub API"))
          return
        }

        resolve(data)
      })
    } catch (error) {
      console.error("Error calling Finnhub API:", error)
      reject(error)
    }
  })
}