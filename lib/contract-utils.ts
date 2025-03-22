import { ethers } from "ethers"
import { parseEther } from "ethers"
import CrowdfundingABI from "@/contracts/CrowdfundingABI.json"

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ""

// Sample data for development
const sampleCampaigns = [
  {
    id: "1",
    title: "Sustainable Energy Project",
    description: "Funding renewable energy solutions for rural communities.",
    goal: "5.0",
    raised: "3.2",
    deadline: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days from now
    owner: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    imageUrl: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "2",
    title: "Educational Platform",
    description: "Building a decentralized learning platform for blockchain development.",
    goal: "2.5",
    raised: "1.8",
    deadline: Math.floor(Date.now() / 1000) + 15 * 24 * 60 * 60, // 15 days from now
    owner: "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2",
    imageUrl: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "3",
    title: "Community Art Initiative",
    description: "Supporting local artists through NFT creation and exhibition.",
    goal: "1.0",
    raised: "0.7",
    deadline: Math.floor(Date.now() / 1000) + 20 * 24 * 60 * 60, // 20 days from now
    owner: "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db",
    imageUrl: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "4",
    title: "Healthcare Innovation",
    description: "Developing blockchain solutions for medical record management.",
    goal: "8.0",
    raised: "2.5",
    deadline: Math.floor(Date.now() / 1000) + 45 * 24 * 60 * 60, // 45 days from now
    owner: "0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB",
    imageUrl: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "5",
    title: "Open Source Development",
    description: "Supporting critical open source infrastructure for Web3.",
    goal: "3.0",
    raised: "2.9",
    deadline: Math.floor(Date.now() / 1000) + 10 * 24 * 60 * 60, // 10 days from now
    owner: "0x617F2E2fD72FD9D5503197092aC168c91465E7f2",
    imageUrl: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "6",
    title: "Decentralized Finance Tool",
    description: "Creating accessible DeFi tools for underserved communities.",
    goal: "4.0",
    raised: "1.2",
    deadline: Math.floor(Date.now() / 1000) + 25 * 24 * 60 * 60, // 25 days from now
    owner: "0x17F6AD8Ef982297579C203069C1DbfFE4348c372",
    imageUrl: "/placeholder.svg?height=400&width=600",
  },
]

export function getCrowdfundingContract(providerOrSigner: any) {
  return new ethers.Contract(contractAddress, CrowdfundingABI, providerOrSigner)
}

export async function getCampaigns() {
  // In a real implementation, this would fetch from the blockchain
  // For now, return sample data
  return sampleCampaigns
}

export async function getFeaturedCampaign() {
  // In a real implementation, this would fetch from the blockchain or a backend
  // For now, return the first sample campaign as featured
  return sampleCampaigns[0]
}

export async function createCampaignOnChain(
  provider: any,
  title: string,
  description: string,
  goal: number,
  durationInDays: number,
  imageUrl: string,
) {
  try {
    const signer = provider.getSigner()
    const contract = getCrowdfundingContract(signer)

    const tx = await contract.createCampaign(
      title,
      description,
      parseEther(goal.toString()),
      durationInDays,
      imageUrl,
    )

    const receipt = await tx.wait()

    // Get campaign ID from event
    const event = receipt.events?.find((event: any) => event.event === "CampaignCreated")

    if (!event) {
      throw new Error("Campaign creation event not found")
    }

    return {
      campaignId: event.args.campaignId.toString(),
      transactionHash: receipt.transactionHash,
    }
  } catch (error) {
    console.error("Error creating campaign on chain:", error)
    throw error
  }
}

export async function contributeToChain(provider: any, campaignId: string, amount: number) {
  try {
    const signer = provider.getSigner()
    const contract = getCrowdfundingContract(signer)

    const tx = await contract.contribute(campaignId, {
      value: parseEther(amount.toString()),
    })

    const receipt = await tx.wait()

    return {
      transactionHash: receipt.transactionHash,
    }
  } catch (error) {
    console.error("Error contributing to campaign:", error)
    throw error
  }
}

export async function claimFundsOnChain(provider: any, campaignId: string) {
  try {
    const signer = provider.getSigner()
    const contract = getCrowdfundingContract(signer)

    const tx = await contract.claimFunds(campaignId)

    const receipt = await tx.wait()

    return {
      transactionHash: receipt.transactionHash,
    }
  } catch (error) {
    console.error("Error claiming funds:", error)
    throw error
  }
}

export async function claimRefundOnChain(provider: any, campaignId: string) {
  try {
    const signer = provider.getSigner()
    const contract = getCrowdfundingContract(signer)

    const tx = await contract.claimRefund(campaignId)

    const receipt = await tx.wait()

    return {
      transactionHash: receipt.transactionHash,
    }
  } catch (error) {
    console.error("Error claiming refund:", error)
    throw error
  }
}

