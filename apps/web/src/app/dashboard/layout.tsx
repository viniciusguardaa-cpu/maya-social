"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
