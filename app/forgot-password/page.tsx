import { ForgotPasswordForm } from "@/components/forgot-password-form"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Forgot Password | CryptoFund",
  description: "Reset your password for your account on our decentralized crowdfunding platform.",
}

export default function ForgotPasswordPage() {
  return (
    <main className="container flex h-[calc(100vh-200px)] items-center px-4 py-12 md:px-6">
      <div className="mx-auto grid w-full max-w-md gap-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Reset Password</h1>
          <p className="text-muted-foreground">Enter your email to receive a password reset link</p>
        </div>
        <ForgotPasswordForm />
        <div className="text-center text-sm">
          Remember your password?{" "}
          <Link href="/login" className="underline">
            Login
          </Link>
        </div>
      </div>
    </main>
  )
}

