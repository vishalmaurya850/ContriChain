"use client"

import React, { useEffect } from "react"
import { CampaignGrid } from "@/components/campaign-grid"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function CampaignsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/login?callbackUrl=/campaigns")
    }
  }, [session, status, router])

  if (status === "loading" || !session) {
    return <p>Loading...</p>
  }

  return (
    <main className="container px-4 py-12 md:px-6 md:py-16">
      <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-6">Campaigns</h1>
      <CampaignGrid />
    </main>
  )
}