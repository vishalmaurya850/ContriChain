import { CampaignFilters } from "@/components/campaign-filters"
import { CampaignGrid } from "@/components/campaign-grid"
import { Suspense } from "react"
import { CampaignGridSkeleton } from "@/components/campaign-grid-skeleton"

export const metadata = {
  title: "Browse Campaigns | CryptoFund",
  description: "Discover and support innovative projects on our decentralized crowdfunding platform.",
}

export default function CampaignsPage() {
  return (
    <main className="container px-4 py-12 md:px-6 md:py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-2">Browse Campaigns</h1>
        <p className="text-muted-foreground">Discover and support innovative projects from around the world</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Suspense fallback={<p>Loading filters...</p>}>
            <CampaignFilters />
          </Suspense>
        </div>
        <div className="lg:col-span-3">
          <Suspense fallback={<CampaignGridSkeleton />}>
            <CampaignGrid />
          </Suspense>
        </div>
      </div>
    </main>
  )
}