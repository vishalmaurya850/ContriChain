import * as finnhub from "finnhub"

// Create a Finnhub API client
const apiKey = process.env.FINNHUB_API_KEY || ""
const finnhubClient = new finnhub.DefaultApi()

// Set the API key
if (apiKey) {
  const api_key = finnhub.ApiClient.instance.authentications["api_key"]
  api_key.apiKey = apiKey
}

export default finnhubClient