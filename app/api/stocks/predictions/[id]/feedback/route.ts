import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { z } from "zod"
import { findOne, updateOne, createObjectId, insertOne } from "@/lib/mongodb-admin"

// Schema for feedback
const feedbackSchema = z.object({
  accuracy: z.number().min(0).max(100),
  feedback: z.string().optional(),
})

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params; // Await the params to resolve the Promise
    const body = await request.json();
    const { accuracy, feedback } = feedbackSchema.parse(body);

    // Check if prediction exists
    const prediction = await findOne("stockPredictions", { _id: createObjectId(id) });

    if (!prediction) {
      return NextResponse.json({ error: "Prediction not found" }, { status: 404 });
    }

    // Add feedback
    const feedbackData = {
      predictionId: id,
      userId: session.user.id,
      accuracy,
      feedback: feedback || "",
      createdAt: new Date(),
    };

    await insertOne("learningFeedback", feedbackData);

    // Update prediction with accuracy if not already set
    if (!prediction.actualOutcome) {
      await updateOne(
        "stockPredictions",
        { _id: createObjectId(id) },
        {
          $set: {
            actualOutcome: {
              accuracy,
              verifiedAt: new Date(),
            },
          },
        }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    console.error("Error adding feedback:", error);
    return NextResponse.json({ error: "Failed to add feedback" }, { status: 500 });
  }
}