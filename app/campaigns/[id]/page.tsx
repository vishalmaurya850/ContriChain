import { CampaignDetails } from "@/components/campaign-details";
import { ContributionForm } from "@/components/contribution-form";
import { CampaignUpdates } from "@/components/campaign-updates";
import { CampaignContributors } from "@/components/campaign-contributors";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCampaignById } from "@/lib/campaign-service";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface CampaignPageProps {
  params: Promise<{ id: string }>; // Update params to be a Promise
}

export async function generateMetadata({ params }: CampaignPageProps): Promise<Metadata> {
  const { id } = await params; // Await the params to resolve the Promise
  const campaign = await getCampaignById(id);

  if (!campaign) {
    return {
      title: "Campaign Not Found | CryptoFund",
    };
  }

  return {
    title: `${campaign.title} | CryptoFund`,
    description: campaign.description.substring(0, 160),
  };
}

export default async function CampaignPage({ params }: CampaignPageProps) {
  const { id } = await params; // Await the params to resolve the Promise
  const campaign = await getCampaignById(id);

  if (!campaign) {
    notFound();
  }

  return (
    <main className="container px-4 py-12 md:px-6 md:py-16">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CampaignDetails
            campaign={{
              ...campaign,
              userId: campaign.userId || "",
              userName: campaign.userName || "",
              createdAt: campaign.createdAt ? new Date(campaign.createdAt) : new Date(), // Ensure createdAt is always a Date
            }}
          />

          <Tabs defaultValue="updates" className="mt-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="updates">Updates</TabsTrigger>
              <TabsTrigger value="contributors">Contributors</TabsTrigger>
            </TabsList>
            <TabsContent value="updates" className="pt-4">
              <CampaignUpdates campaignId={id} />
            </TabsContent>
            <TabsContent value="contributors" className="pt-4">
              <CampaignContributors campaignId={id} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-1">
          <ContributionForm
            campaign={{
              ...campaign,
              userId: campaign.userId || "",
              userName: campaign.userName || "",
              createdAt: campaign.createdAt ? new Date(campaign.createdAt) : new Date(), // Ensure createdAt is always a Date
            }}
          />
        </div>
      </div>
    </main>
  );
}