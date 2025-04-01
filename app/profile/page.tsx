import { ProfileForm } from "@/components/profile-form"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { redirect } from "next/navigation"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Profile | CryptoFund",
  description: "Manage your profile settings on our decentralized crowdfunding platform.",
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login?callbackUrl=/profile")
  }

  return (
    <main className="container px-4 py-12 md:px-6 md:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-2">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your account information and preferences</p>
        </div>

        {session.user && <ProfileForm user={session.user} />}
      </div>
    </main>
  )
}