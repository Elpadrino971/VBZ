"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Music, User, LogOut, LayoutDashboard, Wallet } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export function Navbar() {
  const { data: session, status } = useSession()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-[16px] border-b border-gray-200/30 dark:border-gray-800/30" style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-2xl font-display font-bold">
            <img 
              src="/logo.png" 
              alt="VYbzzZ Logo" 
              className="h-14 w-14 object-contain"
            />
            <span className="bg-gradient-primary bg-clip-text text-transparent text-[#111] dark:text-white">VYbzzZ</span>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            <Link href="/concerts" className="text-[#111] dark:text-white font-medium hover:text-amber-600 dark:hover:text-red-500 transition-colors">
              Concerts
            </Link>
            <Link href="/streamings" className="text-[#111] dark:text-white font-medium hover:text-amber-600 dark:hover:text-red-500 transition-colors">
              Streamings
            </Link>
            {session && session.user.role === "USER" && (
              <Link href="/account" className="text-[#111] dark:text-white font-medium hover:text-amber-600 dark:hover:text-red-500 transition-colors">
                Mes tickets
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            {status === "loading" ? (
              <div className="h-9 w-24 animate-pulse bg-muted rounded-md" />
            ) : session ? (
              <>
                {session.user.role === "ARTIST" && (
                  <>
                    <Link href="/dashboard">
                      <Button variant="outline">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>
                    <Link href="/dashboard/payouts">
                      <Button variant="outline">
                        <Wallet className="mr-2 h-4 w-4" />
                        Paiements
                      </Button>
                    </Link>
                  </>
                )}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button variant="outline">Connexion</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button>Créer un compte</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
