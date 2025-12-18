"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

const shortcuts = [
    { keys: ["⌘", "K"], description: "Busca global" },
    { keys: ["G", "D"], description: "Ir para Dashboard" },
    { keys: ["G", "C"], description: "Ir para Calendário" },
    { keys: ["G", "K"], description: "Ir para Kanban" },
    { keys: ["G", "A"], description: "Ir para Analytics" },
    { keys: ["G", "S"], description: "Ir para Configurações" },
    { keys: ["?"], description: "Mostrar atalhos" },
    { keys: ["Esc"], description: "Fechar modal" },
]

export function KeyboardShortcuts() {
    const [showHelp, setShowHelp] = useState(false)
    const [pendingKey, setPendingKey] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignorar se estiver em input/textarea
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement
            ) {
                return
            }

            // ? = Mostrar atalhos
            if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
                e.preventDefault()
                setShowHelp(true)
                return
            }

            // Escape = Fechar
            if (e.key === "Escape") {
                setShowHelp(false)
                setPendingKey(null)
                return
            }

            // G + letra = Navegação
            if (e.key.toLowerCase() === "g" && !e.metaKey && !e.ctrlKey) {
                e.preventDefault()
                setPendingKey("g")
                setTimeout(() => setPendingKey(null), 1000)
                return
            }

            if (pendingKey === "g") {
                e.preventDefault()
                const key = e.key.toLowerCase()

                const routes: Record<string, string> = {
                    d: "/dashboard",
                    c: "/dashboard/calendar",
                    k: "/dashboard/content",
                    a: "/dashboard/analytics",
                    s: "/dashboard/settings",
                    t: "/dashboard/team",
                    b: "/dashboard/brand",
                    p: "/dashboard/publications",
                    m: "/dashboard/assets",
                    l: "/dashboard/activity",
                }

                if (routes[key]) {
                    router.push(routes[key])
                }
                setPendingKey(null)
            }
        }

        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [pendingKey, router])

    return (
        <>
            {/* Pending Key Indicator */}
            {pendingKey && (
                <div className="fixed bottom-4 right-4 z-50 bg-primary text-primary-foreground px-3 py-2 rounded-lg shadow-lg animate-pulse">
                    <span className="text-sm font-mono">G + ...</span>
                </div>
            )}

            {/* Help Dialog */}
            <Dialog open={showHelp} onOpenChange={setShowHelp}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Atalhos de Teclado</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        {shortcuts.map((shortcut, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    {shortcut.description}
                                </span>
                                <div className="flex gap-1">
                                    {shortcut.keys.map((key, j) => (
                                        <Badge key={j} variant="secondary" className="font-mono px-2">
                                            {key}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <div className="pt-2 border-t text-xs text-muted-foreground">
                            <p><strong>G + D</strong> = Dashboard, <strong>G + C</strong> = Calendário, <strong>G + K</strong> = Kanban</p>
                            <p><strong>G + A</strong> = Analytics, <strong>G + S</strong> = Settings, <strong>G + T</strong> = Team</p>
                            <p><strong>G + B</strong> = Brand, <strong>G + P</strong> = Publications, <strong>G + M</strong> = Assets</p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
