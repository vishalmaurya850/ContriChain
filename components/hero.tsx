import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              Decentralized Crowdfunding
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Fund innovative projects with cryptocurrency. Transparent, secure, and community-driven.
            </p>
          </div>
          <div className="space-x-4">
            <Link href="/campaigns">
              <Button className="px-8">Browse Campaigns</Button>
            </Link>
            <Link href="/create">
              <Button variant="outline" className="px-8">
                Start a Campaign <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}