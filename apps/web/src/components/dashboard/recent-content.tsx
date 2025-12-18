"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface ContentItem {
    id: string
    code: string
    title: string
    type: string
    status: string
    scheduledAt?: string
}

const statusColors: Record<string, "default" | "secondary" | "success" | "warning" | "info" | "destructive"> = {
    PLANNED: "secondary",
    BRIEFED: "info",
    IN_PRODUCTION: "warning",
    READY: "success",
    AWAITING_APPROVAL: "warning",
    APPROVED: "success",
    SCHEDULED: "info",
    PUBLISHED: "success",
    CANCELLED: "destructive",
}

const statusLabels: Record<string, string> = {
    PLANNED: "Planejado",
    BRIEFED: "Briefado",
    IN_PRODUCTION: "Em Produção",
    READY: "Pronto",
    AWAITING_APPROVAL: "Aguardando",
    APPROVED: "Aprovado",
    SCHEDULED: "Agendado",
    PUBLISHED: "Publicado",
    CANCELLED: "Cancelado",
}

const typeIcons: Record<string, string> = {
    FEED: "📷",
    REELS: "🎬",
    STORIES: "📱",
    CAROUSEL: "🎠",
    AD: "📢",
}

interface RecentContentProps {
    items: ContentItem[]
}

export function RecentContent({ items }: RecentContentProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Conteúdos Recentes</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                        >
                            <Avatar className="h-10 w-10">
                                <AvatarFallback className="text-lg">
                                    {typeIcons[item.type] || "📄"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{item.title || item.code}</p>
                                <p className="text-xs text-muted-foreground">{item.code}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <Badge variant={statusColors[item.status] || "secondary"}>
                                    {statusLabels[item.status] || item.status}
                                </Badge>
                                {item.scheduledAt && (
                                    <span className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(item.scheduledAt), {
                                            addSuffix: true,
                                            locale: ptBR,
                                        })}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                    {items.length === 0 && (
                        <p className="text-center text-sm text-muted-foreground py-4">
                            Nenhum conteúdo recente
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
