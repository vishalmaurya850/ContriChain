import { NextResponse } from "next/server";
import { findMany } from "@/lib/mongodb-admin";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    // Await the params to resolve the Promise
    const { id } = await context.params;

    // Get contributions for this campaign
    const contributions = await findMany("contributions", { campaignId: id });

    return NextResponse.json(
      contributions.map((contribution) => ({
        id: contribution._id.toString(),
        ...contribution,
        _id: undefined,
      })),
    );
  } catch (error) {
    console.error("Error fetching contributions:", error);
    return NextResponse.json({ error: "Failed to fetch contributions" }, { status: 500 });
  }
}