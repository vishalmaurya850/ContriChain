import { CreateCampaignForm } from "@/components/create-campaign-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Create Campaign | CryptoFund",
  description: "Start your fundraising campaign on our decentralized crowdfunding platform.",
}

export default function CreateCampaignPage() {
  return (
    <main className="container px-4 py-12 md:px-6 md:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-2">Create a Campaign</h1>
          <p className="text-muted-foreground">Share your idea with the world and raise funds to make it happen</p>
        </div>

        <CreateCampaignForm />
      </div>
    </main>
  )
}

