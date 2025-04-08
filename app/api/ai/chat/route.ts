import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { z } from "zod"
import { GoogleGenerativeAI } from "@google/generative-ai";

// Schema for chat request
const chatSchema = z.object({
  message: z.string().min(1),
  category: z.enum(["stocks"]),
})

export async function POST(request: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { message, category } = chatSchema.parse(body)

    // For development or if Vertex AI credentials are not set up
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        return NextResponse.json({ response: await getGeminiResponse(message, []) });
    }

    // If you have Vertex AI set up, you would use it here
    // For now, we'll use the mock responses
    if (category === "stocks") {
      return NextResponse.json({ 
        response: await getGeminiResponse(message, [])
      })
    } else {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
    }

    console.error("Error generating AI response:", error)
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
  }
}

async function getGeminiResponse(message: string, history: string[]): Promise<string> {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.0-flash-thinking-exp-1219" });

    const chat = model.startChat({
      history: history.map((msg) => ({
        role: msg.startsWith("You:") ? "user" : "model",
        parts: [{ text: msg.replace("You: ", "").replace("AI: ", "") }],
      })),
      generationConfig: {
        maxOutputTokens: 200,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error("Error with Gemini API:", error);
    return "I'm having trouble processing your request about stocks right now. Please try again later.";
  }
}