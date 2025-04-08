import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { findOne, deleteOne, createObjectId } from "@/lib/mongodb-admin";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Await the params to resolve the Promise
    const { id } = await context.params;

    // Get chat session by ID
    const chatSession = await findOne("chatSessions", {
      _id: createObjectId(id),
      userId: session.user.id,
    });

    if (!chatSession) {
      return NextResponse.json({ error: "Chat session not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: chatSession._id.toString(),
      title: chatSession.title,
      messages: chatSession.messages,
      createdAt: chatSession.createdAt,
      updatedAt: chatSession.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching chat session:", error);
    return NextResponse.json({ error: "Failed to fetch chat session" }, { status: 500 });
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

    // Verify the chat session exists and belongs to the user
    const chatSession = await findOne("chatSessions", {
      _id: createObjectId(id),
      userId: session.user.id,
    });

    if (!chatSession) {
      return NextResponse.json({ error: "Chat session not found" }, { status: 404 });
    }

    // Delete the chat session
    await deleteOne("chatSessions", {
      _id: createObjectId(id),
      userId: session.user.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting chat session:", error);
    return NextResponse.json({ error: "Failed to delete chat session" }, { status: 500 });
  }
}