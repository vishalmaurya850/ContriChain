import { Card, CardContent } from "@/components/ui/card"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "White Paper | CryptoFund",
  description: "CryptoFund: Decentralized Crowdfunding Platform White Paper",
}

export default function WhitePaperPage() {
  return (
    <main className="container px-4 py-12 md:px-6 md:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl mb-4">CryptoFund White Paper</h1>
          <p className="text-xl text-muted-foreground">Decentralized Crowdfunding Platform</p>
          <p className="mt-2 text-sm text-muted-foreground">Version 1.0 | {new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-8 prose dark:prose-invert max-w-none">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">Abstract</h2>
              <p>
                CryptoFund is a decentralized crowdfunding platform built on blockchain technology that aims to
                revolutionize how projects are funded and supported. By leveraging smart contracts on the Ethereum
                blockchain, CryptoFund provides a transparent, secure, and efficient way for creators to raise funds and
                for backers to support projects they believe in. This white paper outlines the platforms architecture,
                tokenomics, governance model, and roadmap.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
              <p>
                Traditional crowdfunding platforms face several challenges, including high fees, centralized control,
                limited global access, and lack of transparency. CryptoFund addresses these issues by creating a
                decentralized alternative that operates on blockchain technology, specifically the Ethereum network.
              </p>
              <p>The key advantages of CryptoFund include:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Transparency:</strong> All transactions and project details are recorded on the blockchain,
                  providing complete transparency to backers.
                </li>
                <li>
                  <strong>Lower Fees:</strong> By eliminating intermediaries, CryptoFund significantly reduces platform
                  fees compared to traditional crowdfunding services.
                </li>
                <li>
                  <strong>Global Access:</strong> Anyone with an internet connection and cryptocurrency can participate,
                  regardless of geographical location or banking access.
                </li>
                <li>
                  <strong>Smart Contract Security:</strong> Funds are held in escrow by smart contracts until predefined
                  conditions are met, protecting backers from fraud.
                </li>
                <li>
                  <strong>Community Governance:</strong> Platform decisions are made through a decentralized governance
                  model where stakeholders can vote on proposals.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">2. Platform Architecture</h2>
              <h3 className="text-xl font-semibold mt-6 mb-3">2.1 Smart Contract System</h3>
              <p>
                The core of CryptoFund is built on a system of smart contracts that handle campaign creation, fund
                collection, and distribution. The primary smart contract is the CrowdfundingFactory, which deploys
                individual campaign contracts when creators initiate new projects.
              </p>
              <p>Each campaign contract includes the following key functions:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Campaign creation with details such as funding goal, deadline, and reward tiers</li>
                <li>Contribution processing and tracking</li>
                <li>Milestone-based fund release mechanisms</li>
                <li>Refund processing if funding goals are not met</li>
                <li>Dispute resolution protocols</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">2.2 Frontend Application</h3>
              <p>
                The user interface is built using Next.js, providing a responsive and intuitive experience across
                devices. The frontend communicates with the blockchain through Web3.js and ethers.js libraries, allowing
                users to interact with the smart contracts seamlessly.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">2.3 AI Integration</h3>
              <p>CryptoFund incorporates advanced AI capabilities powered by Google Vertex AI to provide:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Funding advice and project optimization recommendations</li>
                <li>Risk assessment for potential backers</li>
                <li>Market trend analysis and investment insights</li>
                <li>Stock market predictions using historical data from Alpha Vantage</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">3. Tokenomics</h2>
              <p>
                The CryptoFund ecosystem is powered by the CFUND token, which serves multiple purposes within the
                platform:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Governance:</strong> CFUND holders can vote on platform upgrades, fee structures, and other
                  governance decisions.
                </li>
                <li>
                  <strong>Fee Reduction:</strong> Users can stake CFUND tokens to reduce platform fees when creating or
                  contributing to campaigns.
                </li>
                <li>
                  <strong>Rewards:</strong> Active participants earn CFUND tokens for various activities such as
                  creating successful campaigns, contributing to projects, or participating in governance.
                </li>
                <li>
                  <strong>Premium Features:</strong> Access to advanced analytics, AI insights, and premium tools
                  requires CFUND tokens.
                </li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">3.1 Token Distribution</h3>
              <p>The total supply of CFUND tokens is capped at 100 million, distributed as follows:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>40% - Community rewards and ecosystem growth</li>
                <li>20% - Team and advisors (vested over 3 years)</li>
                <li>15% - Private sale</li>
                <li>10% - Public sale</li>
                <li>10% - Platform development fund</li>
                <li>5% - Marketing and partnerships</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">4. Governance Model</h2>
              <p>
                CryptoFund employs a decentralized autonomous organization (DAO) structure for governance, allowing
                stakeholders to participate in decision-making processes. The governance model includes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Proposal System:</strong> Any CFUND holder can submit proposals for platform changes or
                  improvements.
                </li>
                <li>
                  <strong>Voting Mechanism:</strong> Proposals are voted on by token holders, with voting power
                  proportional to the number of tokens held or staked.
                </li>
                <li>
                  <strong>Implementation Committee:</strong> A rotating committee of elected members is responsible for
                  implementing approved proposals.
                </li>
                <li>
                  <strong>Transparency Reports:</strong> Regular reports on platform performance, financials, and
                  governance activities are published on-chain.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">5. Roadmap</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold">Phase 1: Foundation (Q2 2023)</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Launch of core smart contracts on Ethereum mainnet</li>
                    <li>Release of MVP web application</li>
                    <li>Basic campaign creation and contribution functionality</li>
                    <li>Integration with popular wallets</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold">Phase 2: Expansion (Q4 2023)</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>CFUND token launch and distribution</li>
                    <li>Implementation of governance system</li>
                    <li>Advanced campaign features (milestone-based funding, reward tiers)</li>
                    <li>Mobile application release</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold">Phase 3: Innovation (Q2 2024)</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>AI integration for funding advice and market predictions</li>
                    <li>Cross-chain functionality (support for multiple blockchains)</li>
                    <li>NFT integration for exclusive backer rewards</li>
                    <li>Advanced analytics dashboard</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold">Phase 4: Ecosystem (Q4 2024)</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Developer API for third-party integrations</li>
                    <li>Decentralized marketplace for project services</li>
                    <li>Integration with DeFi protocols for yield generation on held funds</li>
                    <li>Enterprise solutions for businesses and organizations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">6. Conclusion</h2>
              <p>
                CryptoFund represents a significant advancement in the crowdfunding space, leveraging blockchain
                technology to create a more transparent, efficient, and accessible platform for project funding. By
                combining smart contracts, tokenized incentives, and decentralized governance, CryptoFund aims to
                empower creators and backers alike.
              </p>
              <p>
                The integration of AI capabilities further enhances the platforms value proposition, providing users
                with data-driven insights and predictions to make more informed decisions. As the platform evolves, the
                community-driven governance model will ensure that CryptoFund continues to adapt to user needs and
                market conditions.
              </p>
              <p>
                We invite developers, creators, investors, and enthusiasts to join us in building the future of
                decentralized crowdfunding.
              </p>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground mt-8">
            <p>© {new Date().getFullYear()} CryptoFund. All rights reserved.</p>
            <p>
              This white paper is for informational purposes only and does not constitute financial or investment
              advice.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}