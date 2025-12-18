"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Menu, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/store"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { data: session, status } = useSession()
    const router = useRouter()
    const { user, currentOrg, setUser, setCurrentOrg, setCurrentBrand } = useAuthStore()

    useEffect(() => {
        if (status === "loading") return

        // If NextAuth session exists, sync with local store
        if (session?.user) {
            if (!user) {
                setUser({
                    id: (session.user as any).id || "google-user",
                    email: session.user.email || "",
                    name: session.user.name || "",
                    avatar: session.user.image || undefined,
                })
                setCurrentOrg({
                    id: "google-org-1",
                    name: "Minha Organização",
                    slug: "minha-org",
                    role: "OWNER",
                })
                setCurrentBrand({
                    id: "google-brand-1",
                    name: "Minha Marca",
                    slug: "minha-marca",
                })
            }
            return
        }

        // If no NextAuth session and no local user, redirect to login
        if (!user && !currentOrg) {
            router.push("/login")
        }
    }, [session, status, user, currentOrg, router, setUser, setCurrentOrg, setCurrentBrand])

    // Show loading while checking auth
    if (status === "loading") {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Mobile Menu Button */}
            <Button
                variant="ghost"
                size="icon"
                className="fixed top-4 left-4 z-50 lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed lg:static inset-y-0 left-0 z-40
                transform transition-transform duration-200 ease-in-out
                ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <Sidebar brandName="Maya" />
            </div>

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-auto p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
