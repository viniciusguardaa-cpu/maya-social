"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
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
    Clock,
    Search,
    Moon,
    Sun,
    LogOut,
    Plus,
    ArrowRight
} from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { toast } from "sonner"

const pages = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, keywords: ["home", "início"] },
    { title: "Calendário", href: "/dashboard/calendar", icon: Calendar, keywords: ["agenda", "schedule", "gantt"] },
    { title: "Conteúdos", href: "/dashboard/content", icon: FileText, keywords: ["kanban", "posts", "cards"] },
    { title: "Assets", href: "/dashboard/assets", icon: Image, keywords: ["imagens", "vídeos", "mídia", "upload"] },
    { title: "Publicações", href: "/dashboard/publications", icon: Send, keywords: ["agendar", "postar", "instagram"] },
    { title: "Analytics", href: "/dashboard/analytics", icon: BarChart3, keywords: ["métricas", "gráficos", "relatórios"] },
    { title: "Templates", href: "/dashboard/templates", icon: Sparkles, keywords: ["padrões", "modelos"] },
    { title: "Atividades", href: "/dashboard/activity", icon: Clock, keywords: ["histórico", "log", "ações"] },
    { title: "Equipe", href: "/dashboard/team", icon: Users, keywords: ["membros", "time", "usuários"] },
    { title: "Marca", href: "/dashboard/brand", icon: Building2, keywords: ["brand", "configurações", "cores"] },
    { title: "Configurações", href: "/dashboard/settings", icon: Settings, keywords: ["preferências", "conta", "perfil"] },
]

const actions = [
    { title: "Novo Conteúdo", action: "new-content", icon: Plus, keywords: ["criar", "adicionar"] },
    { title: "Gerar Brief com IA", action: "generate-brief", icon: Sparkles, keywords: ["ia", "automático"] },
    { title: "Upload de Assets", action: "upload", icon: Image, keywords: ["imagem", "vídeo", "arquivo"] },
    { title: "Exportar Relatório", action: "export", icon: BarChart3, keywords: ["csv", "json", "download"] },
]

export function CommandPalette() {
    const [open, setOpen] = useState(false)
    const router = useRouter()
    const { theme, setTheme } = useTheme()

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    const handleSelect = (href: string) => {
        setOpen(false)
        router.push(href)
    }

    const handleAction = (action: string) => {
        setOpen(false)
        switch (action) {
            case "new-content":
                router.push("/dashboard/content")
                toast.info("Crie um novo conteúdo no calendário")
                break
            case "generate-brief":
                router.push("/dashboard/content")
                toast.info("Selecione um conteúdo para gerar brief")
                break
            case "upload":
                router.push("/dashboard/assets")
                toast.info("Faça upload de novos assets")
                break
            case "export":
                router.push("/dashboard/analytics")
                toast.info("Exporte relatórios em Analytics")
                break
            case "toggle-theme":
                setTheme(theme === "dark" ? "light" : "dark")
                toast.success(`Tema alterado para ${theme === "dark" ? "claro" : "escuro"}`)
                break
            case "logout":
                localStorage.removeItem("token")
                window.location.href = "/login"
                break
        }
    }

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Buscar páginas, ações..." />
            <CommandList>
                <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

                <CommandGroup heading="Páginas">
                    {pages.map((page) => {
                        const Icon = page.icon
                        return (
                            <CommandItem
                                key={page.href}
                                value={`${page.title} ${page.keywords.join(" ")}`}
                                onSelect={() => handleSelect(page.href)}
                            >
                                <Icon className="mr-2 h-4 w-4" />
                                <span>{page.title}</span>
                            </CommandItem>
                        )
                    })}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Ações Rápidas">
                    {actions.map((action) => {
                        const Icon = action.icon
                        return (
                            <CommandItem
                                key={action.action}
                                value={`${action.title} ${action.keywords.join(" ")}`}
                                onSelect={() => handleAction(action.action)}
                            >
                                <Icon className="mr-2 h-4 w-4" />
                                <span>{action.title}</span>
                            </CommandItem>
                        )
                    })}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Sistema">
                    <CommandItem
                        value="alternar tema dark light escuro claro"
                        onSelect={() => handleAction("toggle-theme")}
                    >
                        {theme === "dark" ? (
                            <Sun className="mr-2 h-4 w-4" />
                        ) : (
                            <Moon className="mr-2 h-4 w-4" />
                        )}
                        <span>Alternar Tema</span>
                    </CommandItem>
                    <CommandItem
                        value="sair logout deslogar"
                        onSelect={() => handleAction("logout")}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sair</span>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}
