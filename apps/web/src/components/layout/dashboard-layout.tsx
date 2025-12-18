"use client"

import { ReactNode } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"

interface DashboardLayoutProps {
    children: ReactNode
    title?: string
    brandName?: string
}

export function DashboardLayout({ children, title, brandName }: DashboardLayoutProps) {
    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar brandName={brandName} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header title={title} />
                <main className="flex-1 overflow-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
