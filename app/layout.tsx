import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import ClientSessionProvider from "@/components/session-provider"
import type { Metadata } from "next"
import { AuthProvider } from "@/components/auth-provider"
import { Inter } from "next/font/google"
import "./globals.css"
import { FlagsmithProvider } from "@/lib/flagsmith"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CryptoFund | Decentralized Crowdfunding Platform",
  description: "Support innovative projects and ideas with cryptocurrency. Transparent, secure, and community-driven.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FlagsmithProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <ClientSessionProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <div className="flex-1">{children}</div>
              <Footer />
            </div>
            <Toaster />
            </ClientSessionProvider>
          </AuthProvider>
        </ThemeProvider>
        </FlagsmithProvider>
      </body>
    </html>
  )
}

