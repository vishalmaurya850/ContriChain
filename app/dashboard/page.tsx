import { UserCampaigns } from "@/components/user-campaigns"
import { UserContributions } from "@/components/user-contributions"
import { UserStats } from "@/components/user-stats"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"

export const metadata: Metadata = {
  title: "Dashboard | CryptoFund",
  description: "Manage your campaigns and contributions on our decentralized crowdfunding platform.",
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login?callbackUrl=/dashboard")
  }

  return (
    <main className="container px-4 py-12 md:px-6 md:py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Manage your campaigns and contributions</p>
      </div>

      <UserStats />

      <Tabs defaultValue="campaigns" className="mt-8">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="campaigns">My Campaigns</TabsTrigger>
          <TabsTrigger value="contributions">My Contributions</TabsTrigger>
        </TabsList>
        <TabsContent value="campaigns" className="pt-6">
          <UserCampaigns />
        </TabsContent>
        <TabsContent value="contributions" className="pt-6">
          <UserContributions />
        </TabsContent>
      </Tabs>
    </main>
  )
}