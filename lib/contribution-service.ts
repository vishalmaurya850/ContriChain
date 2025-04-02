"use client"

import useSWR from "swr"

// Client-side fetcher function
const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch data")
    return res.json()
  })

export function useCampaignContributions(campaignId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    campaignId ? `/api/campaigns/${campaignId}/contributions` : null,
    fetcher,
  )

  return {
    contributions: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

export function useUserContributions(userId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR(userId ? `/api/users/${userId}/contributions` : null, fetcher)

  return {
    contributions: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

// Client-side function to create a contribution
export async function createContribution(
  campaignId: string,
  data: {
    amount: number
    transactionHash: string
  },
) {
  const response = await fetch(`/api/campaigns/${campaignId}/contribute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to create contribution")
  }

  return response.json()
}