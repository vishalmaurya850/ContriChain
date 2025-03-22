import { ArrowRight, Coins, FileCheck, Users } from "lucide-react"

export function HowItWorks() {
  return (
    <section className="py-12 md:py-24 bg-muted/50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">How It Works</h2>
          <p className="max-w-[700px] text-muted-foreground">
            Our decentralized crowdfunding platform makes it easy to fund and support projects you believe in.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <FileCheck className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">Create a Campaign</h3>
            <p className="text-muted-foreground">
              Set up your fundraising campaign with details, goals, and timeline. No middlemen or gatekeepers.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">Share & Promote</h3>
            <p className="text-muted-foreground">
              Share your campaign with your network and the wider community to gain support.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Coins className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">Receive Funding</h3>
            <p className="text-muted-foreground">
              Funds are held in a smart contract and released when your campaign reaches its goal.
            </p>
          </div>
        </div>

        <div className="flex justify-center mt-12">
          <a href="/create" className="inline-flex items-center text-primary hover:underline">
            Start your campaign <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  )
}

