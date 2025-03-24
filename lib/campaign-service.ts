"use client"

import useSWR from "swr"

// Client-side fetcher function
const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch data")
    return res.json()
  })

export function useAllCampaigns(options?: {
  category?: string
  status?: string
}) {
  // Build query string
  let queryString = ""
  if (options?.category) {
    queryString += `${queryString ? "&" : "?"}category=${options.category}`
  }
  if (options?.status) {
    queryString += `${queryString ? "&" : "?"}status=${options.status}`
  }

  // Use SWR for data fetching with caching and revalidation
  const { data, error, isLoading, mutate } = useSWR(`/api/campaigns${queryString}`, fetcher)

  return {
    campaigns: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

export function useCampaignById(id: string) {
  const { data, error, isLoading, mutate } = useSWR(id ? `/api/campaigns/${id}` : null, fetcher)

  return {
    campaign: data,
    isLoading,
    isError: error,
    mutate,
  }
}

export function useUserCampaigns(userId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR(userId ? `/api/users/${userId}/campaigns` : null, fetcher)

  return {
    campaigns: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

// Client-side function to create a campaign
export async function createCampaign(campaignData: {
  title: string
  description: string
  goal: number
  duration: number
  category: string
  imageUrl?: string
  onChainId: string
  transactionHash: string
}) {
  const response = await fetch("/api/campaigns", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(campaignData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to create campaign")
  }

  return response.json()
}

// Client-side function to update a campaign
export async function updateCampaign(
  id: string,
  data: Partial<{
    title: string
    description: string
    imageUrl: string
    status: "active" | "paused" | "completed"
  }>,
) {
  const response = await fetch(`/api/campaigns/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to update campaign")
  }

  return response.json()
}

// Client-side function to delete a campaign
export async function deleteCampaign(id: string) {
  const response = await fetch(`/api/campaigns/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to delete campaign")
  }

  return true
}

export async function getAllCampaigns(filters: { category?: string; status?: string }) {
  const response = await fetch("/api/campaigns", {
    method: "POST",
    body: JSON.stringify(filters),
  })
  const campaigns = await response.json()

  type Campaign = {
    id: string
    title: string
    description: string
    goal: number
    raised: number
    status: string
    category: string
    imageUrl?: string
    deadline: string
    userName: string
  }

  return campaigns.map((campaign: Campaign) => ({
    id: campaign.id,
    title: campaign.title,
    description: campaign.description,
    goal: campaign.goal,
    raised: campaign.raised, // Ensure this is included
    status: campaign.status,
    category: campaign.category,
    imageUrl: campaign.imageUrl,
    deadline: campaign.deadline,
    userName: campaign.userName,
  }))
}

export async function getCampaignById(id: string): Promise<{ id: string; title: string; description: string; goal: number; status: string; category: string; imageUrl?: string; raised: number; deadline: string; userId: string; userName: string; createdAt: string; onChainId: string; transactionHash: string; }> {
  const response = await fetch(`/api/campaigns/${id}`)

  if (!response.ok) {
    throw new Error("Failed to fetch campaign")
  }

  return response.json()
}

