import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { z } from "zod"

// Schema for user registration
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate request body
    const { name, email, password } = registerSchema.parse(body)

    try {
      // For development, create a mock user without database
      if (process.env.NODE_ENV === "development" && (process.env.USE_MOCK_DB === "true" || !process.env.MONGODB_URI)) {
        // Return a successful response with mock data
        return NextResponse.json(
          {
            id: "mock-user-id",
            name,
            email: email.toLowerCase(),
          },
          { status: 201 },
        )
      }

      // Import dynamically to avoid issues with the mock DB
      const { findOne, insertOne } = await import("@/lib/mongodb-admin")

      try {
        // Check if user already exists
        const existingUser = await findOne("users", { email: email.toLowerCase() })

        if (existingUser) {
          return NextResponse.json({ message: "User with this email already exists" }, { status: 400 })
        }

        // Hash password
        const hashedPassword = await hash(password, 12)

        // Create user
        const userData = {
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
          isAdmin: false,
          createdAt: new Date(),
        }

        const result = await insertOne("users", userData)

        return NextResponse.json(
          {
            id: result.insertedId.toString(),
            name,
            email: email.toLowerCase(),
          },
          { status: 201 },
        )
      } catch (dbError) {
        console.error("Database operation error:", dbError)

        // If we're in development, return a successful mock response
        if (process.env.NODE_ENV === "development") {
          console.warn("Using mock response for registration in development")
          return NextResponse.json(
            {
              id: "mock-user-id",
              name,
              email: email.toLowerCase(),
            },
            { status: 201 },
          )
        }

        throw dbError
      }
    } catch (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ message: "Database connection error" }, { status: 500 })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Validation failed", errors: error.errors }, { status: 400 })
    }

    console.error("Registration error:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}