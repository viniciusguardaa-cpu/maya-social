"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Calendar,
    FileText,
    Image,
    Send,
    BarChart3,
    Settings,
    Users,
    Building2,
    Sparkles,
    ChevronLeft,
    Clock,
    Hash,
} from "lucide-react"
import { useState } from "react"
import { BrandSwitcher } from "@/components/brand-switcher"

const mainNav = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Calendário", href: "/dashboard/calendar", icon: Calendar },
    { title: "Conteúdos", href: "/dashboard/content", icon: FileText },
    { title: "Assets", href: "/dashboard/assets", icon: Image },
    { title: "Publicações", href: "/dashboard/publications", icon: Send },
    { title: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
]

const secondaryNav = [
    { title: "Templates", href: "/dashboard/templates", icon: Sparkles },
    { title: "Hashtags", href: "/dashboard/hashtags", icon: Hash },
    { title: "Atividades", href: "/dashboard/activity", icon: Clock },
    { title: "Equipe", href: "/dashboard/team", icon: Users },
    { title: "Marca", href: "/dashboard/brand", icon: Building2 },
    { title: "Configurações", href: "/dashboard/settings", icon: Settings },
]

interface SidebarProps {
    brandName?: string
}

export function Sidebar({ brandName = "Maya" }: SidebarProps) {
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useState(false)

    return (
        <aside className={cn(
            "flex flex-col h-full border-r bg-card shrink-0 transition-all duration-200",
            collapsed ? "w-[60px]" : "w-[240px]"
        )}>
            {/* Logo */}
            <div className="h-14 flex items-center px-4 border-b shrink-0">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                        <Sparkles className="h-4 w-4 text-primary-foreground" />
                    </div>
                    {!collapsed && <span className="font-bold">Maya</span>}
                </Link>
            </div>

            {/* Brand Switcher */}
            {!collapsed && (
                <div className="p-2 border-b">
                    <BrandSwitcher />
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-2">
                <div className="space-y-1">
                    {mainNav.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                                    isActive
                                        ? "bg-secondary text-secondary-foreground font-medium"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <Icon className="h-4 w-4 shrink-0" />
                                {!collapsed && <span>{item.title}</span>}
                            </Link>
                        )
                    })}
                </div>

                <div className="my-4 h-px bg-border" />

                <div className="space-y-1">
                    {secondaryNav.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                                    isActive
                                        ? "bg-secondary text-secondary-foreground font-medium"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <Icon className="h-4 w-4 shrink-0" />
                                {!collapsed && <span>{item.title}</span>}
                            </Link>
                        )
                    })}
                </div>
            </nav>

            {/* Collapse Toggle */}
            <div className="border-t p-2 shrink-0">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                    <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
                    {!collapsed && <span>Recolher</span>}
                </button>
            </div>
        </aside>
    )
}
