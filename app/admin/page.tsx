import { AdminStats } from "@/components/admin-stats"
import { AdminCampaignList } from "@/components/admin-campaign-list"
import { AdminTransactionList } from "@/components/admin-transaction-list"
import { AdminUserList } from "@/components/admin-user-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { isAdmin } from "@/lib/admin-service"

export const metadata: Metadata = {
  title: "Admin Dashboard | CryptoFund",
  description: "Admin dashboard for managing the decentralized crowdfunding platform.",
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login?callbackUrl=/admin")
  }

  if (!session.user) {
    redirect("/login?callbackUrl=/admin")
  }

  const userId = (session.user as { id: string }).id
  const userIsAdmin = await isAdmin(userId)

  if (!userIsAdmin) {
    redirect("/dashboard")
  }

  return (
    <main className="container px-4 py-12 md:px-6 md:py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage campaigns, users, and transactions</p>
      </div>

      <AdminStats />

      <Tabs defaultValue="campaigns" className="mt-8">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        <TabsContent value="campaigns" className="pt-6">
          <AdminCampaignList />
        </TabsContent>
        <TabsContent value="transactions" className="pt-6">
          <AdminTransactionList />
        </TabsContent>
        <TabsContent value="users" className="pt-6">
          <AdminUserList />
        </TabsContent>
      </Tabs>
    </main>
  )
}

