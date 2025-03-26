"use client"

import useSWR from "swr"

// Client-side fetcher function
const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch data")
    return res.json()
  })

export function useAdminStats() {
  const { data, error, isLoading, mutate } = useSWR("/api/admin/stats", fetcher)

  return {
    stats: data || {
      totalCampaigns: 0,
      activeCampaigns: 0,
      totalUsers: 0,
      totalFundsRaised: 0,
      transactionsToday: 0,
    },
    isLoading,
    isError: error,
    mutate,
  }
}

export function useAdminTransactions(options?: {
  page?: number
  limit?: number
  status?: string
}) {
  // Build query string
  let queryString = ""
  if (options?.page) {
    queryString += `${queryString ? "&" : "?"}page=${options.page}`
  }
  if (options?.limit) {
    queryString += `${queryString ? "&" : "?"}limit=${options.limit}`
  }
  if (options?.status) {
    queryString += `${queryString ? "&" : "?"}status=${options.status}`
  }

  const { data, error, isLoading, mutate } = useSWR(`/api/admin/transactions${queryString}`, fetcher)

  return {
    transactions: data?.transactions || [],
    totalPages: data?.totalPages || 1,
    totalCount: data?.totalCount || 0,
    isLoading,
    isError: error,
    mutate,
  }
}

export function useAdminUsers() {
  const { data, error, isLoading, mutate } = useSWR("/api/admin/users", fetcher)

  return {
    users: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

export async function toggleUserAdmin(userId: string, isAdmin: boolean): Promise<boolean> {
  const response = await fetch(`/api/admin/users/${userId}/toggle-admin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ isAdmin: !isAdmin }),
  })

  if (!response.ok) {
    throw new Error("Failed to toggle admin status")
  }

  return true
}

