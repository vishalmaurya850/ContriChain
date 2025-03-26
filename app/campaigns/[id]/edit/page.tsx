import { EditCampaignForm } from "@/components/edit-campaign-form"
import { getCampaignById } from "@/lib/campaign-service-server"
import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import type { Metadata } from "next"

interface EditCampaignPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: EditCampaignPageProps): Promise<Metadata> {
  const { id } = await params // Await the params to resolve the promise
  const rawCampaign = await getCampaignById(id)
  const campaign = rawCampaign && 'userId' in rawCampaign && 'description' in rawCampaign && 'status' in rawCampaign
    ? rawCampaign as { id: string; title?: string; userId: string; description: string; status: "active" | "paused" | "completed"; imageUrl?: string }
    : null

  if (!campaign) {
    return {
      title: "Campaign Not Found | CryptoFund",
    }
  }

  return {
    title: `Edit ${campaign.title || "Untitled Campaign"} | CryptoFund`,
    description: `Edit your campaign: ${campaign.title}`,
  }
}

export default async function EditCampaignPage({ params }: EditCampaignPageProps) {
  const { id } = await params // Await the params to resolve the promise
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect(`/login?callbackUrl=/campaigns/${id}/edit`)
  }

  const rawCampaign = await getCampaignById(id)
  const campaign = rawCampaign && 'userId' in rawCampaign && 'description' in rawCampaign && 'status' in rawCampaign
    ? rawCampaign as { id: string; title?: string; userId: string; description: string; status: "active" | "paused" | "completed"; imageUrl?: string }
    : null

  if (!campaign) {
    notFound()
  }

  // Check if user is the owner or an admin
  if (!session.user || (campaign.userId !== session.user.id && !session.user.isAdmin)) {
    redirect(`/campaigns/${id}`)
  }

  return (
    <main className="container px-4 py-12 md:px-6 md:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-2">Edit Campaign</h1>
          <p className="text-muted-foreground">Update your campaign details</p>
        </div>

        <EditCampaignForm campaign={{ ...campaign, title: campaign.title || "Untitled Campaign", description: campaign.description, status: campaign.status }} />
      </div>
    </main>
  )
}