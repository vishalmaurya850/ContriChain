import { FeaturedCampaign } from "@/components/featured-campaign"
import { FlagsmithProvider } from "@/lib/flagsmith"
import { CampaignList } from "@/components/campaign-list"
import { HowItWorks } from "@/components/how-it-works"
import { Hero } from "@/components/hero"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <FlagsmithProvider>
      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-8 text-center">Featured Campaign</h2>
          <FeaturedCampaign />
        </div>
      </section>
      

      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-8 text-center">Active Campaigns</h2>
          <CampaignList />
        </div>
      </section>
      </FlagsmithProvider>

      <HowItWorks />
    </main>
  )
}

