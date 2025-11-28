"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Music, User, LogOut, LayoutDashboard } from "lucide-react"

export function Navbar() {
  const { data: session, status } = useSession()

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Music className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">VYbzzZ</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link href="/concerts">
              <Button variant="ghost">Concerts</Button>
            </Link>

            {status === "loading" ? (
              <div className="h-9 w-24 animate-pulse bg-muted rounded-md" />
            ) : session ? (
              <>
                {session.user.role === "ARTIST" && (
                  <Link href="/dashboard">
                    <Button variant="outline">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                )}
                {session.user.role === "USER" && (
                  <Link href="/account">
                    <Button variant="outline">
                      <User className="mr-2 h-4 w-4" />
                      Mon compte
                    </Button>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button variant="ghost">Connexion</Button>
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
