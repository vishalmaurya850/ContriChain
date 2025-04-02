import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { z } from "zod"
import { findOne, updateOne, deleteOne, createObjectId } from "@/lib/mongodb-admin"

// Schema for campaign updates
const updateCampaignSchema = z.object({
  title: z.string().min(5).max(100).optional(),
  description: z.string().min(20).max(2000).optional(),
  imageUrl: z.string().url().optional(),
  status: z.enum(["active", "paused", "completed"]).optional(),
})

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    // Await the params to resolve the Promise
    const { id } = await context.params;

    const campaign = await findOne("campaigns", { _id: createObjectId(id) });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: campaign._id.toString(),
      ...campaign,
      _id: undefined,
    });
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json({ error: "Failed to fetch campaign" }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Await the params to resolve the Promise
    const { id } = await context.params;

    const campaign = await findOne("campaigns", { _id: createObjectId(id) });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const userIsAdmin = session.user.isAdmin;
    if (campaign.userId !== session.user.id && !userIsAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateCampaignSchema.parse(body);

    await updateOne(
      "campaigns",
      { _id: createObjectId(id) },
      {
        $set: {
          ...validatedData,
          updatedAt: new Date(),
        },
      },
    );

    const updatedCampaign = await findOne("campaigns", { _id: createObjectId(id) });

    if (!updatedCampaign) {
      return NextResponse.json({ error: "Failed to retrieve updated campaign" }, { status: 500 });
    }

    return NextResponse.json({
      id: updatedCampaign._id.toString(),
      ...updatedCampaign,
      _id: undefined,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }

    console.error("Error updating campaign:", error);
    return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Await the params to resolve the Promise
    const { id } = await context.params;

    const campaign = await findOne("campaigns", { _id: createObjectId(id) });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const userIsAdmin = session.user.isAdmin;
    if (campaign.userId !== session.user.id && !userIsAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await deleteOne("campaigns", { _id: createObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json({ error: "Failed to delete campaign" }, { status: 500 });
  }
}