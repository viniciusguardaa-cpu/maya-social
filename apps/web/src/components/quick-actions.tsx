"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Plus,
    Calendar,
    FileText,
    Upload,
    Sparkles,
    Send,
    BarChart3,
    Users,
    Zap
} from "lucide-react"
import { toast } from "sonner"

interface QuickAction {
    id: string
    title: string
    description: string
    icon: React.ReactNode
    color: string
    action: () => void
}

export function QuickActions() {
    const router = useRouter()

    const actions: QuickAction[] = [
        {
            id: "new-content",
            title: "Novo Conteúdo",
            description: "Criar post no calendário",
            icon: <Plus className="h-5 w-5" />,
            color: "bg-blue-500",
            action: () => {
                router.push("/dashboard/calendar")
                toast.info("Clique em uma data para criar")
            }
        },
        {
            id: "generate-brief",
            title: "Gerar Brief IA",
            description: "Brief automático com IA",
            icon: <Sparkles className="h-5 w-5" />,
            color: "bg-purple-500",
            action: () => {
                router.push("/dashboard/content")
                toast.info("Selecione um conteúdo para gerar brief")
            }
        },
        {
            id: "upload-asset",
            title: "Upload Asset",
            description: "Adicionar mídia",
            icon: <Upload className="h-5 w-5" />,
            color: "bg-green-500",
            action: () => router.push("/dashboard/assets")
        },
        {
            id: "schedule-post",
            title: "Agendar Post",
            description: "Programar publicação",
            icon: <Send className="h-5 w-5" />,
            color: "bg-orange-500",
            action: () => router.push("/dashboard/publications")
        },
        {
            id: "view-analytics",
            title: "Ver Analytics",
            description: "Métricas e relatórios",
            icon: <BarChart3 className="h-5 w-5" />,
            color: "bg-cyan-500",
            action: () => router.push("/dashboard/analytics")
        },
        {
            id: "presentation",
            title: "Apresentação",
            description: "Modo cliente",
            icon: <FileText className="h-5 w-5" />,
            color: "bg-pink-500",
            action: () => router.push("/dashboard/presentation")
        },
    ]

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Zap className="h-4 w-4 text-primary" />
                    Ações Rápidas
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {actions.map((action) => (
                        <button
                            key={action.id}
                            onClick={action.action}
                            className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:border-primary hover:bg-muted/50 transition-all group"
                        >
                            <div className={`p-3 rounded-full ${action.color} text-white group-hover:scale-110 transition-transform`}>
                                {action.icon}
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium">{action.title}</p>
                                <p className="text-xs text-muted-foreground">{action.description}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
