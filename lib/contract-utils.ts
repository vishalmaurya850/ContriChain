import { ethers, parseEther, Interface } from "ethers"
import CrowdfundingABI from "@/contracts/CrowdfundingABI.json"
import { contractAddress } from "@/lib/contract-address"

export async function getCampaigns() {
  if (!contractAddress) {
    console.error("Contract address is not set")
    return []
  }

  // Mock data for demonstration purposes
  return [
    {
      id: "1",
      title: "Revolutionary AI Project",
      description: "Funding a groundbreaking AI initiative to solve global challenges and improve lives worldwide.",
      goal: "50",
      raised: "12.5",
      deadline: Date.now() / 1000 + 60 * 60 * 24 * 30, // 30 days from now
      owner: "0xf39Fd6e51B89c69c746F393ca526E26298c68F3",
      imageUrl: "/ai_project.jpg",
    },
    {
      id: "2",
      title: "Clean Water Initiative",
      description: "Supporting the development of sustainable water purification systems for communities in need.",
      goal: "25",
      raised: "8.2",
      deadline: Date.now() / 1000 + 60 * 60 * 24 * 60, // 60 days from now
      owner: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      imageUrl: "/water_initiative.jpg",
    },
    {
      id: "3",
      title: "Educational Program for Underprivileged Children",
      description: "Providing access to quality education and resources for children in underserved areas.",
      goal: "15",
      raised: "3.7",
      deadline: Date.now() / 1000 + 60 * 60 * 24 * 90, // 90 days from now
      owner: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      imageUrl: "/education_program.jpg",
    },
  ]
}

export async function getFeaturedCampaign() {
  if (!contractAddress) {
    console.error("Contract address is not set")
    return null
  }

  // Mock data for demonstration purposes
  return {
    id: "4",
    title: "Eco-Friendly Housing Project",
    description:
      "Creating affordable and sustainable housing solutions using eco-friendly materials and innovative designs.",
    goal: "100",
    raised: "68.4",
    deadline: Date.now() / 1000 + 60 * 60 * 24 * 120, // 120 days from now
    owner: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    imageUrl: "/eco_housing.jpg",
  }
}

export function getCrowdfundingContract(provider: ethers.JsonRpcProvider | ethers.Signer) {
  if (!contractAddress) {
    throw new Error("Contract address is not set")
  }

  return new ethers.Contract(contractAddress, CrowdfundingABI, provider)
}

export async function createCampaignOnChain(
  provider: ethers.JsonRpcProvider,
  title: string,
  description: string,
  goal: number,
  duration: number,
  imageUrl: string,
) {
  if (!contractAddress) {
    throw new Error("Contract address is not set")
  }

  const signer = await provider.getSigner()
  const contract = new ethers.Contract(contractAddress, CrowdfundingABI, signer)

  const goalInWei = parseEther(goal.toString())

  try {
    const tx = await contract.createCampaign(title, description, goalInWei, duration, imageUrl)
    await tx.wait()

    // Extract campaign ID from event (this part needs to be adapted based on your actual event)
    const receipt = await provider.getTransactionReceipt(tx.hash)
    const iface = new Interface(CrowdfundingABI)

    if (!receipt || !receipt.logs) {
      throw new Error("No logs found in transaction receipt")
    }

    const campaignCreatedEvent = receipt.logs
      .map((log) => {
        try {
          return iface.parseLog(log)
        } catch {
          return null
        }
      })
      .find((event) => event?.name === "CampaignCreated")

    if (!campaignCreatedEvent) {
      throw new Error("CampaignCreated event not found")
    }

    const campaignId = campaignCreatedEvent.args.campaignId.toString()

    return { campaignId: campaignId, transactionHash: tx.hash }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error creating campaign on chain:", error.message)
    } else {
      console.error("Error creating campaign on chain:", error)
    }
    throw new Error(`An error occurred while processing the transaction: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export async function contributeToChain(provider: ethers.JsonRpcProvider, campaignId: string, amount: number) {
  if (!contractAddress) {
    throw new Error("Contract address is not set")
  }

  const signer = await provider.getSigner()
  const contract = new ethers.Contract(contractAddress, CrowdfundingABI, signer)

  const amountInWei = parseEther(amount.toString())

  try {
    const tx = await contract.contribute(campaignId, { value: amountInWei })
    await tx.wait()
    return { transactionHash: tx.hash }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error contributing to campaign:", error.message)
    } else {
      console.error("Error contributing to campaign:", error)
    }
    throw error
  }
}

export async function claimFundsOnChain(provider: ethers.JsonRpcProvider, campaignId: string) {
  if (!contractAddress) {
    throw new Error("Contract address is not set")
  }

  const signer = await provider.getSigner()
  const contract = new ethers.Contract(contractAddress, CrowdfundingABI, signer)

  try {
    const tx = await contract.claimFunds(campaignId)
    await tx.wait()
    return { transactionHash: tx.hash }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error claiming funds:", error.message)
    } else {
      console.error("Error claiming funds:", error)
    }
    throw error
  }
}

export async function claimRefundOnChain(provider: ethers.JsonRpcProvider, campaignId: string) {
  if (!contractAddress) {
    throw new Error("Contract address is not set")
  }

  const signer = await provider.getSigner()
  const contract = new ethers.Contract(contractAddress, CrowdfundingABI, signer)

  try {
    const tx = await contract.claimRefund(campaignId)
    await tx.wait()
    return { transactionHash: tx.hash }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error claiming refund:", error.message)
    } else {
      console.error("Error claiming refund:", error)
    }
    throw error
  }
}

