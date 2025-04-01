import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { z } from "zod";
import { findOne, insertOne, updateOne, createObjectId } from "@/lib/mongodb-admin";
import { ObjectId } from "mongodb";

interface Campaign {
  _id: ObjectId;
  title: string;
  raised: number; // Ensure this matches your database schema
}

interface CustomDocument {
  _id: ObjectId;
  [key: string]: unknown;
}

interface TransactionDocument extends CustomDocument {
  type: string;
  campaignId: string;
  campaignTitle: string;
  userId: string;
  userName: string;
  amount: number;
  transactionHash: string;
  timestamp: Date;
  status: string;
}

const contributionSchema = z.object({
  amount: z.number().positive(),
  transactionHash: z.string(),
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;

    const campaign = await findOne<Campaign>("campaigns", { _id: createObjectId(id) });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = contributionSchema.parse(body);

    if (!session.user) {
      return NextResponse.json({ error: "User session is invalid" }, { status: 400 });
    }

    const user = await findOne("users", { _id: createObjectId(session.user.id) });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const contributionData = {
      campaignId: id,
      campaignTitle: campaign.title,
      userId: session.user.id,
      userName: user.name || session.user.name,
      userImage: user.image || session.user.image,
      amount: validatedData.amount,
      transactionHash: validatedData.transactionHash,
      timestamp: new Date(),
    };

    const contributionResult = await insertOne("contributions", contributionData as unknown as Document);

    await updateOne<Campaign>(
      "campaigns",
      { _id: createObjectId(id) },
      { $set: { raised: campaign.raised + validatedData.amount } } as unknown as Partial<Campaign>,
    );

    const transactionData: TransactionDocument = {
      _id: new ObjectId(),
      type: "contribution",
      campaignId: id,
      campaignTitle: campaign.title,
      userId: session.user.id,
      userName: user.name || session.user.name,
      amount: validatedData.amount,
      transactionHash: validatedData.transactionHash,
      timestamp: new Date(),
      status: "confirmed",
    };

    await insertOne("transactions", transactionData as unknown as Document);

    return NextResponse.json(
      {
        id: contributionResult.insertedId.toString(),
        ...contributionData,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }

    console.error("Error processing contribution:", error);
    return NextResponse.json({ error: "Failed to process contribution" }, { status: 500 });
  }
}