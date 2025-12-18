"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Search,
    Filter,
    RefreshCw,
    ArrowRight,
    FileText,
    MessageSquare,
    CheckCircle,
    Upload,
    UserPlus,
    Settings,
    Calendar,
    Sparkles,
    Clock
} from "lucide-react"

interface Activity {
    id: string
    type: "content_created" | "content_moved" | "brief_generated" | "comment_added" | "asset_uploaded" | "member_invited" | "settings_changed" | "content_scheduled"
    description: string
    user: string
    target?: string
    metadata?: Record<string, string>
    createdAt: string
}

const mockActivities: Activity[] = [
    { id: "1", type: "content_moved", description: "moveu conteúdo para Aprovado", user: "Ana Silva", target: "MAYA_RL_12", createdAt: "Há 5 min" },
    { id: "2", type: "comment_added", description: "comentou em conteúdo", user: "Carlos Santos", target: "MAYA_FD_08", metadata: { comment: "Aprovado! Pode agendar." }, createdAt: "Há 15 min" },
    { id: "3", type: "brief_generated", description: "gerou brief com IA", user: "Vinicius Garcia", target: "MAYA_CA_05", createdAt: "Há 30 min" },
    { id: "4", type: "asset_uploaded", description: "fez upload de 3 arquivos", user: "Maria Oliveira", createdAt: "Há 1h" },
    { id: "5", type: "content_scheduled", description: "agendou publicação", user: "Ana Silva", target: "MAYA_RL_12", metadata: { date: "17/01 às 10:00" }, createdAt: "Há 1h" },
    { id: "6", type: "content_created", description: "criou novo conteúdo", user: "Sistema", target: "MAYA_ST_03", metadata: { type: "STORIES" }, createdAt: "Há 2h" },
    { id: "7", type: "member_invited", description: "convidou novo membro", user: "Vinicius Garcia", metadata: { email: "joao@maya.com" }, createdAt: "Há 3h" },
    { id: "8", type: "settings_changed", description: "atualizou configurações da marca", user: "Vinicius Garcia", createdAt: "Há 4h" },
    { id: "9", type: "content_moved", description: "moveu conteúdo para Em Produção", user: "Maria Oliveira", target: "MAYA_FD_09", createdAt: "Há 5h" },
    { id: "10", type: "comment_added", description: "comentou em conteúdo", user: "Ana Silva", target: "MAYA_CA_05", metadata: { comment: "Ficou ótimo!" }, createdAt: "Há 6h" },
    { id: "11", type: "brief_generated", description: "gerou brief com IA", user: "Carlos Santos", target: "MAYA_RL_13", createdAt: "Há 8h" },
    { id: "12", type: "asset_uploaded", description: "fez upload de 5 arquivos", user: "Maria Oliveira", createdAt: "Há 1 dia" },
    { id: "13", type: "content_created", description: "criou 7 novos conteúdos", user: "Sistema", metadata: { count: "7" }, createdAt: "Há 1 dia" },
    { id: "14", type: "content_moved", description: "moveu conteúdo para Publicado", user: "Ana Silva", target: "MAYA_FD_07", createdAt: "Há 2 dias" },
    { id: "15", type: "settings_changed", description: "atualizou templates", user: "Vinicius Garcia", createdAt: "Há 2 dias" },
]

const activityConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
    content_created: { icon: <FileText className="h-4 w-4" />, color: "text-blue-600", bg: "bg-blue-100" },
    content_moved: { icon: <ArrowRight className="h-4 w-4" />, color: "text-purple-600", bg: "bg-purple-100" },
    brief_generated: { icon: <Sparkles className="h-4 w-4" />, color: "text-amber-600", bg: "bg-amber-100" },
    comment_added: { icon: <MessageSquare className="h-4 w-4" />, color: "text-green-600", bg: "bg-green-100" },
    asset_uploaded: { icon: <Upload className="h-4 w-4" />, color: "text-cyan-600", bg: "bg-cyan-100" },
    member_invited: { icon: <UserPlus className="h-4 w-4" />, color: "text-pink-600", bg: "bg-pink-100" },
    settings_changed: { icon: <Settings className="h-4 w-4" />, color: "text-slate-600", bg: "bg-slate-100" },
    content_scheduled: { icon: <Calendar className="h-4 w-4" />, color: "text-indigo-600", bg: "bg-indigo-100" },
}

const filterOptions = [
    { value: "all", label: "Todas" },
    { value: "content", label: "Conteúdos" },
    { value: "comments", label: "Comentários" },
    { value: "uploads", label: "Uploads" },
    { value: "team", label: "Equipe" },
]

export default function ActivityPage() {
    const [activities] = useState<Activity[]>(mockActivities)
    const [filter, setFilter] = useState("all")
    const [searchQuery, setSearchQuery] = useState("")

    const filteredActivities = activities.filter(activity => {
        const matchesFilter = filter === "all" ||
            (filter === "content" && ["content_created", "content_moved", "content_scheduled", "brief_generated"].includes(activity.type)) ||
            (filter === "comments" && activity.type === "comment_added") ||
            (filter === "uploads" && activity.type === "asset_uploaded") ||
            (filter === "team" && ["member_invited", "settings_changed"].includes(activity.type))

        const matchesSearch = searchQuery === "" ||
            activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            activity.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
            activity.target?.toLowerCase().includes(searchQuery.toLowerCase())

        return matchesFilter && matchesSearch
    })

    const getInitials = (name: string) => {
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    }

    const todayActivities = filteredActivities.filter(a => a.createdAt.includes("min") || a.createdAt.includes("h"))
    const olderActivities = filteredActivities.filter(a => a.createdAt.includes("dia"))

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Atividades</h1>
                    <p className="text-muted-foreground">
                        Histórico de ações da equipe
                    </p>
                </div>
                <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar atividades..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {filterOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{activities.filter(a => a.type.includes("content")).length}</p>
                            <p className="text-xs text-muted-foreground">Conteúdos</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <MessageSquare className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{activities.filter(a => a.type === "comment_added").length}</p>
                            <p className="text-xs text-muted-foreground">Comentários</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{activities.filter(a => a.type === "brief_generated").length}</p>
                            <p className="text-xs text-muted-foreground">Briefs IA</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-cyan-100 flex items-center justify-center">
                            <Upload className="h-5 w-5 text-cyan-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{activities.filter(a => a.type === "asset_uploaded").length}</p>
                            <p className="text-xs text-muted-foreground">Uploads</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Activity Timeline */}
            <div className="space-y-6">
                {/* Today */}
                {todayActivities.length > 0 && (
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Hoje
                        </h3>
                        <Card>
                            <CardContent className="p-0 divide-y">
                                {todayActivities.map((activity) => {
                                    const config = activityConfig[activity.type]
                                    return (
                                        <div key={activity.id} className="flex items-start gap-4 p-4">
                                            <Avatar className="h-9 w-9">
                                                <AvatarFallback className="text-xs bg-primary/10">
                                                    {getInitials(activity.user)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-medium">{activity.user}</span>
                                                    <span className="text-muted-foreground">{activity.description}</span>
                                                    {activity.target && (
                                                        <Badge variant="outline" className="font-mono text-xs">
                                                            {activity.target}
                                                        </Badge>
                                                    )}
                                                </div>
                                                {activity.metadata?.comment && (
                                                    <p className="text-sm text-muted-foreground mt-1 bg-muted/50 p-2 rounded">
                                                        "{activity.metadata.comment}"
                                                    </p>
                                                )}
                                                {activity.metadata?.date && (
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        📅 {activity.metadata.date}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <div className={`p-1.5 rounded-full ${config.bg}`}>
                                                    <span className={config.color}>{config.icon}</span>
                                                </div>
                                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {activity.createdAt}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Older */}
                {olderActivities.length > 0 && (
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Anteriores
                        </h3>
                        <Card>
                            <CardContent className="p-0 divide-y">
                                {olderActivities.map((activity) => {
                                    const config = activityConfig[activity.type]
                                    return (
                                        <div key={activity.id} className="flex items-start gap-4 p-4">
                                            <Avatar className="h-9 w-9">
                                                <AvatarFallback className="text-xs bg-primary/10">
                                                    {getInitials(activity.user)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-medium">{activity.user}</span>
                                                    <span className="text-muted-foreground">{activity.description}</span>
                                                    {activity.target && (
                                                        <Badge variant="outline" className="font-mono text-xs">
                                                            {activity.target}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <div className={`p-1.5 rounded-full ${config.bg}`}>
                                                    <span className={config.color}>{config.icon}</span>
                                                </div>
                                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {activity.createdAt}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {filteredActivities.length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <Clock className="h-16 w-16 text-muted-foreground/50 mb-4" />
                            <p className="text-lg font-medium text-muted-foreground">Nenhuma atividade encontrada</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
