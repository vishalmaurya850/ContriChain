import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { findOne, createObjectId } from "@/lib/mongodb-admin"

export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
  ): Promise<Response> {
    const session = await getServerSession(authOptions);
  
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  
    try {
      // Await the params to resolve the Promise
      const { id } = await context.params;
  
      // Get prediction by ID
      const prediction = await findOne("stockPredictions", { _id: createObjectId(id) });
  
      if (!prediction) {
        return NextResponse.json({ error: "Prediction not found" }, { status: 404 });
      }
  
      return NextResponse.json({
        id: prediction._id.toString(),
        ...prediction,
        _id: undefined,
      });
    } catch (error) {
      console.error("Error fetching prediction:", error);
      return NextResponse.json({ error: "Failed to fetch prediction" }, { status: 500 });
    }
  }