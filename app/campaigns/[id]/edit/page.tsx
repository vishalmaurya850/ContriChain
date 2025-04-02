import { EditCampaignForm } from "@/components/edit-campaign-form";
import { getCampaignById } from "@/lib/campaign-service-server";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import type { Metadata } from "next";

interface EditCampaignPageProps {
  params: Promise<{ id: string }>; // Update params to be a Promise
}

export async function generateMetadata({ params }: EditCampaignPageProps): Promise<Metadata> {
  const { id } = await params; // Await the params to resolve the Promise
  const campaignData = await getCampaignById(id);

  const campaign = campaignData
    ? {
        ...campaignData,
        description: "No description provided",
      }
    : null;

  if (!campaign || !campaign.title) {
    return {
      title: "Campaign Not Found | CryptoFund",
    };
  }

  return {
    title: `Edit ${campaign.title} | CryptoFund`,
    description: `Edit your campaign: ${campaign.title}`,
  };
}

export default async function EditCampaignPage({ params }: EditCampaignPageProps) {
  const { id } = await params; // Await the params to resolve the Promise
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(`/login?callbackUrl=/campaigns/${id}/edit`);
  }

  const campaignData = await getCampaignById(id);

  const campaign = campaignData
    ? {
        ...campaignData,
        description: campaignData.description || "No description provided",
        status: (["active", "paused", "completed"].includes(campaignData.status ?? "")
          ? campaignData.status
          : "active") as "active" | "paused" | "completed",
      }
    : null;

  if (!campaign) {
    notFound();
  }

  // Check if user is the owner or an admin
  if (campaign.userId !== session.user.id && !session.user.isAdmin) {
    redirect(`/campaigns/${id}`);
  }

  return (
    <main className="container px-4 py-12 md:px-6 md:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-2">Edit Campaign</h1>
          <p className="text-muted-foreground">Update your campaign details</p>
        </div>

        <EditCampaignForm campaign={campaign} />
      </div>
    </main>
  );
}