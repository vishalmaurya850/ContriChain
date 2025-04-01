"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname} from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, LogOut, FileText, LineChart } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { ConnectWalletButton } from "@/components/connect-wallet-button"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  // const router = useRouter()
  const { data: session, status } = useSession()
  const isLoading = status === "loading"

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Handle sign out with redirect
  const handleSignOut = async () => {
    await signOut({ redirect: false })
    window.location.href = "/login"
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <div className="px-7">
                <Link href="/" className="flex items-center font-bold text-lg">
                  CryptoFund
                </Link>
              </div>
              <nav className="flex flex-col gap-4 px-7 py-6">
                <Link
                  href="/"
                  className={`text-sm font-medium ${pathname === "/" ? "text-primary" : "text-muted-foreground"}`}
                >
                  Home
                </Link>
                {session && (
                  <Link
                    href="/ai-assistant"
                    className={`text-sm font-medium ${pathname === "/ai-assistant" ? "text-primary" : "text-muted-foreground"}`}
                  >
                    Stock Advisor
                  </Link>
                )}
                <Link
                  href="/campaigns"
                  className={`text-sm font-medium ${pathname === "/campaigns" || pathname.startsWith("/campaigns/") ? "text-primary" : "text-muted-foreground"}`}
                >
                  Campaigns
                </Link>
                <Link
                  href="/create"
                  className={`text-sm font-medium ${pathname === "/create" ? "text-primary" : "text-muted-foreground"}`}
                >
                  Create Campaign
                </Link>
                <Link
                  href="/whitepaper"
                  className={`text-sm font-medium ${pathname === "/whitepaper" ? "text-primary" : "text-muted-foreground"}`}
                >
                  White Paper
                </Link>
                {session ? (
                  <>
                    <Link
                      href="/dashboard"
                      className={`text-sm font-medium ${pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"}`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      className={`text-sm font-medium ${pathname === "/profile" ? "text-primary" : "text-muted-foreground"}`}
                    >
                      Profile
                    </Link>
                    {session.user?.isAdmin && (
                      <Link
                        href="/admin"
                        className={`text-sm font-medium ${pathname === "/admin" ? "text-primary" : "text-muted-foreground"}`}
                      >
                        Admin
                      </Link>
                    )}
                  </>
                ) : null}
              </nav>
              <div className="px-7 py-2">
                <ConnectWalletButton />
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl hidden md:inline-block">CryptoFund</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm font-medium ${pathname === "/" ? "text-primary" : "text-muted-foreground"} transition-colors hover:text-primary`}
          >
            Home
          </Link>
          {session && (
            <Link
              href="/ai-assistant"
              className={`text-sm font-medium flex items-center gap-1 ${pathname === "/ai-assistant" ? "text-primary" : "text-muted-foreground"} transition-colors hover:text-primary`}
            >
              <LineChart className="h-4 w-4" />
              Stock Advisor
            </Link>
          )}
          <Link
            href="/campaigns"
            className={`text-sm font-medium ${pathname === "/campaigns" || pathname.startsWith("/campaigns/") ? "text-primary" : "text-muted-foreground"} transition-colors hover:text-primary`}
          >
            Campaigns
          </Link>
          <Link
            href="/create"
            className={`text-sm font-medium ${pathname === "/create" ? "text-primary" : "text-muted-foreground"} transition-colors hover:text-primary`}
          >
            Create Campaign
          </Link>
          <Link
            href="/whitepaper"
            className={`text-sm font-medium flex items-center gap-1 ${pathname === "/whitepaper" ? "text-primary" : "text-muted-foreground"} transition-colors hover:text-primary`}
          >
            <FileText className="h-4 w-4" />
            White Paper
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {isLoading ? (
            <Button variant="ghost" size="sm" disabled>
              Loading...
            </Button>
          ) : session ? (
            <div className="flex items-center gap-2">
              <ConnectWalletButton />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                      <AvatarFallback>
                        {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {session.user?.name && <p className="font-medium">{session.user.name}</p>}
                      {session.user?.email && (
                        <p className="w-[200px] truncate text-sm text-muted-foreground">{session.user.email}</p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/ai-assistant">
                      <LineChart className="mr-2 h-4 w-4" />
                      Stock Advisor
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  {session.user?.isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Admin</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={(event) => {
                      event.preventDefault()
                      handleSignOut()
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ConnectWalletButton />
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/register" className="hidden sm:block">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
