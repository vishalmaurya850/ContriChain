import { RegisterForm } from "@/components/register-form"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Register | CryptoFund",
  description: "Create an account on our decentralized crowdfunding platform.",
}

export default function RegisterPage() {
  return (
    <main className="container flex h-[calc(100vh-200px)] items-center px-4 py-12 md:px-6">
      <div className="mx-auto grid w-full max-w-md gap-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Create an Account</h1>
          <p className="text-muted-foreground">Enter your details to create an account</p>
        </div>
        <RegisterForm />
        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Login
          </Link>
        </div>
      </div>
    </main>
  )
}