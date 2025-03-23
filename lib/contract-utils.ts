import { ethers, Contract, JsonRpcProvider } from "ethers"
import CrowdfundingABI from "@/contracts/CrowdfundingABI.json"

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ""

export function getCrowdfundingContract(providerOrSigner: ethers.Provider | ethers.Signer) {
  return new Contract(contractAddress, CrowdfundingABI, providerOrSigner)
}

export async function getCampaigns() {
  try {
    // Connect to a provider
    const provider = new JsonRpcProvider(process.env.ETHEREUM_RPC_URL)
    const contract = getCrowdfundingContract(provider)

    // Get campaign count
    const campaignCount = await contract.campaignCount()

    // Fetch all campaigns
    const campaigns = []

    for (let i = 0; i < Number(campaignCount); i++) {
      const campaignDetails = await contract.getCampaignDetails(i)

      campaigns.push({
        id: i.toString(),
        title: campaignDetails.title,
        description: campaignDetails.description,
        goal: ethers.formatEther(campaignDetails.goal),
        raised: ethers.formatEther(campaignDetails.amountRaised),
        deadline: Number(campaignDetails.deadline),
        owner: campaignDetails.owner,
        imageUrl: campaignDetails.imageUrl,
        claimed: campaignDetails.claimed,
      })
    }

    return campaigns
  } catch (error) {
    console.error("Error fetching campaigns from blockchain:", error)
    throw error
  }
}

export async function getFeaturedCampaign() {
  try {
    const provider = new JsonRpcProvider(process.env.ETHEREUM_RPC_URL)
    const contract = getCrowdfundingContract(provider)

    // Get campaign count
    const campaignCount = await contract.campaignCount()

    if (Number(campaignCount) === 0) {
      return null
    }

    // Find the campaign with the highest percentage funded
    let featuredCampaignId = 0
    let highestPercentage = 0

    for (let i = 0; i < Number(campaignCount); i++) {
      const campaignDetails = await contract.getCampaignDetails(i)

      if (Number(campaignDetails.deadline) > Math.floor(Date.now() / 1000)) {
        const goal = ethers.formatEther(campaignDetails.goal)
        const raised = ethers.formatEther(campaignDetails.amountRaised)
        const percentage = Number.parseFloat(raised) / Number.parseFloat(goal)

        if (percentage > highestPercentage) {
          highestPercentage = percentage
          featuredCampaignId = i
        }
      }
    }

    // Get the featured campaign details
    const featuredCampaignDetails = await contract.getCampaignDetails(featuredCampaignId)

    return {
      id: featuredCampaignId.toString(),
      title: featuredCampaignDetails.title,
      description: featuredCampaignDetails.description,
      goal: ethers.formatEther(featuredCampaignDetails.goal),
      raised: ethers.formatEther(featuredCampaignDetails.amountRaised),
      deadline: Number(featuredCampaignDetails.deadline),
      owner: featuredCampaignDetails.owner,
      imageUrl: featuredCampaignDetails.imageUrl,
      claimed: featuredCampaignDetails.claimed,
    }
  } catch (error) {
    console.error("Error fetching featured campaign from blockchain:", error)
    throw error
  }
}

export async function createCampaignOnChain(
  provider: JsonRpcProvider,
  title: string,
  description: string,
  goal: number,
  durationInDays: number,
  imageUrl: string,
) {
  try {
    const signer = await provider.getSigner()
    const contract = getCrowdfundingContract(signer)

    const tx = await contract.createCampaign(
      title,
      description,
      ethers.parseEther(goal.toString()),
      durationInDays,
      imageUrl,
    )

    const receipt = await tx.wait()

    // Get campaign ID from event
    const event = receipt?.logs.find((log: ethers.Log): boolean => {
      try {
        const parsedLog = contract.interface.parseLog(log)
        return parsedLog?.name === "CampaignCreated"
      } catch {
        return false
      }
    })

    if (!event) {
      throw new Error("Campaign creation event not found")
    }

    const parsedEvent = contract.interface.parseLog(event)

    return {
      campaignId: parsedEvent?.args.campaignId.toString(),
      transactionHash: receipt?.hash,
    }
  } catch (error) {
    console.error("Error creating campaign on chain:", error)
    throw error
  }
}

export async function contributeToChain(provider: JsonRpcProvider, campaignId: string, amount: number) {
  try {
    const signer = await provider.getSigner()
    const contract = getCrowdfundingContract(signer)

    const tx = await contract.contribute(campaignId, {
      value: ethers.parseEther(amount.toString()),
    })

    const receipt = await tx.wait()

    return {
      transactionHash: receipt?.hash,
    }
  } catch (error) {
    console.error("Error contributing to campaign:", error)
    throw error
  }
}

export async function claimFundsOnChain(provider: JsonRpcProvider, campaignId: string) {
  try {
    const signer = await provider.getSigner()
    const contract = getCrowdfundingContract(signer)

    const tx = await contract.claimFunds(campaignId)

    const receipt = await tx.wait()

    return {
      transactionHash: receipt?.hash,
    }
  } catch (error) {
    console.error("Error claiming funds:", error)
    throw error
  }
}

export async function claimRefundOnChain(provider: JsonRpcProvider, campaignId: string) {
  try {
    const signer = await provider.getSigner()
    const contract = getCrowdfundingContract(signer)

    const tx = await contract.claimRefund(campaignId)

    const receipt = await tx.wait()

    return {
      transactionHash: receipt?.hash,
    }
  } catch (error) {
    console.error("Error claiming refund:", error)
    throw error
  }
}