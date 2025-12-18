"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { NotificationsPopover } from "@/components/notifications-popover"

interface HeaderProps {
    title?: string
}

export function Header({ title }: HeaderProps) {
    const { theme, setTheme } = useTheme()

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark")
    }

    const handleLogout = () => {
        localStorage.removeItem("token")
        window.location.href = "/login"
    }

    return (
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-6">
                {title && <h1 className="text-xl font-semibold">{title}</h1>}
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Buscar conteúdos..." className="w-64 pl-9" />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={toggleTheme}>
                    {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </Button>

                <NotificationsPopover />

                <Button variant="ghost" className="relative h-9 w-9 rounded-full" onClick={handleLogout}>
                    <Avatar className="h-9 w-9">
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                </Button>
            </div>
        </header>
    )
}
