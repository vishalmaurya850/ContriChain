import { LoginForm } from "@/components/login-form"
import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Login | CryptoFund",
  description: "Log in to your account on our decentralized crowdfunding platform.",
}

export default function LoginPage() {
  return (
    <main className="container flex h-[calc(100vh-200px)] items-center px-4 py-12 md:px-6">
      <div className="mx-auto grid w-full max-w-md gap-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Login</h1>
          <p className="text-muted-foreground">Enter your credentials to access your account</p>
        </div>
        <Suspense fallback={<p>Loading login form...</p>}>
          <LoginForm />
        </Suspense>
        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="underline">
            Register
          </Link>
        </div>
      </div>
    </main>
  )
}