"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/lib/store"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Calendar,
    FileText,
    CheckCircle,
    Clock,
    TrendingUp,
    AlertCircle,
    BarChart3,
    Send,
} from "lucide-react"

interface ContentItem {
    id: string
    code: string
    type: string
    status: string
    scheduledAt?: string
    brief?: { title?: string }
}

interface KanbanData {
    columns: Record<string, ContentItem[]>
    counts: Record<string, number>
    total: number
}

export default function DashboardPage() {
    const { currentOrg, currentBrand } = useAuthStore()
    const [kanban, setKanban] = useState<KanbanData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            if (!currentOrg || !currentBrand) return

            try {
                const response = await api.get(
                    `/organizations/${currentOrg.id}/brands/${currentBrand.id}/content/kanban`
                )
                setKanban(response.data)
            } catch (error) {
                console.error("Failed to fetch kanban:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [currentOrg, currentBrand])

    const stats = kanban ? {
        awaiting: kanban.counts.AWAITING_APPROVAL || 0,
        production: kanban.counts.IN_PRODUCTION || 0,
        scheduled: kanban.counts.SCHEDULED || 0,
        total: kanban.total || 0,
    } : { awaiting: 0, production: 0, scheduled: 0, total: 0 }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">
                    {currentBrand?.name || "Maya Brand"} - Visão geral
                </p>
            </div>

            {/* Stats cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Aprovações</CardTitle>
                        <CheckCircle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-12" /> : stats.awaiting}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Agendados</CardTitle>
                        <Clock className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-12" /> : stats.scheduled}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Em Produção</CardTitle>
                        <FileText className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-12" /> : stats.production}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total do Mês</CardTitle>
                        <Calendar className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-12" /> : stats.total}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Content List */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Conteúdos Recentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                            </div>
                        ) : kanban ? (
                            <div className="space-y-3">
                                {Object.values(kanban.columns).flat().slice(0, 5).map((item) => (
                                    <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{item.brief?.title || item.code}</p>
                                            <p className="text-xs text-muted-foreground font-mono">{item.code}</p>
                                        </div>
                                        <Badge variant="outline">{item.type}</Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-center py-4">Nenhum conteúdo</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Ações Rápidas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-3">
                            <a href="/dashboard/calendar" className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                                <Calendar className="h-5 w-5 text-primary" />
                                <span className="text-sm font-medium">Calendário</span>
                            </a>
                            <a href="/dashboard/content" className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                                <FileText className="h-5 w-5 text-primary" />
                                <span className="text-sm font-medium">Conteúdos</span>
                            </a>
                            <a href="/dashboard/analytics" className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                                <BarChart3 className="h-5 w-5 text-primary" />
                                <span className="text-sm font-medium">Analytics</span>
                            </a>
                            <a href="/dashboard/publications" className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                                <Send className="h-5 w-5 text-primary" />
                                <span className="text-sm font-medium">Publicar</span>
                            </a>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

