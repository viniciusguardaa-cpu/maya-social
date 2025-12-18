"use client"

import { useMemo } from "react"
import { format, eachDayOfInterval, startOfMonth, endOfMonth, differenceInDays, isWithinInterval } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface ContentItem {
    id: string
    code: string
    type: string
    status: string
    scheduledAt?: string
    brief?: { title?: string }
}

interface GanttChartProps {
    items: ContentItem[]
    currentMonth: Date
    onItemClick?: (item: ContentItem) => void
}

const statusColors: Record<string, string> = {
    PLANNED: "bg-slate-400",
    BRIEFED: "bg-blue-400",
    IN_PRODUCTION: "bg-purple-500",
    READY: "bg-cyan-500",
    AWAITING_APPROVAL: "bg-yellow-500",
    APPROVED: "bg-green-500",
    SCHEDULED: "bg-indigo-500",
    PUBLISHED: "bg-emerald-600",
}

const statusLabels: Record<string, string> = {
    PLANNED: "Planejado",
    BRIEFED: "Briefado",
    IN_PRODUCTION: "Produção",
    READY: "Pronto",
    AWAITING_APPROVAL: "Aprovação",
    APPROVED: "Aprovado",
    SCHEDULED: "Agendado",
    PUBLISHED: "Publicado",
}

const typeIcons: Record<string, string> = {
    FEED: "📷",
    REELS: "🎬",
    STORIES: "📱",
    CAROUSEL: "🎠",
    AD: "📢",
}

export function GanttChart({ items, currentMonth, onItemClick }: GanttChartProps) {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

    const sortedItems = useMemo(() => {
        return [...items].sort((a, b) => {
            if (!a.scheduledAt) return 1
            if (!b.scheduledAt) return -1
            return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
        })
    }, [items])

    const getBarPosition = (item: ContentItem) => {
        if (!item.scheduledAt) return null

        const scheduledDate = new Date(item.scheduledAt)
        const dayIndex = differenceInDays(scheduledDate, monthStart)

        if (dayIndex < 0 || dayIndex >= days.length) return null

        return {
            left: `${(dayIndex / days.length) * 100}%`,
            width: `${Math.max(100 / days.length, 3)}%`,
        }
    }

    return (
        <div className="w-full overflow-x-auto">
            {/* Header - Days */}
            <div className="min-w-[800px]">
                <div className="flex border-b sticky top-0 bg-background z-10">
                    <div className="w-48 shrink-0 p-2 border-r font-medium text-sm text-muted-foreground">
                        Conteúdo
                    </div>
                    <div className="flex-1 flex">
                        {days.map((day, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "flex-1 min-w-[24px] text-center text-xs py-2 border-r",
                                    format(day, "EEE", { locale: ptBR }) === "sáb" ||
                                        format(day, "EEE", { locale: ptBR }) === "dom"
                                        ? "bg-muted/50"
                                        : ""
                                )}
                            >
                                <div className="font-medium">{format(day, "d")}</div>
                                <div className="text-muted-foreground text-[10px]">
                                    {format(day, "EEE", { locale: ptBR })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Rows */}
                <div className="divide-y">
                    {sortedItems.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            Nenhum conteúdo para exibir
                        </div>
                    ) : (
                        sortedItems.map((item) => {
                            const barPos = getBarPosition(item)

                            return (
                                <div
                                    key={item.id}
                                    className="flex hover:bg-muted/30 transition-colors cursor-pointer"
                                    onClick={() => onItemClick?.(item)}
                                >
                                    {/* Item Info */}
                                    <div className="w-48 shrink-0 p-2 border-r">
                                        <div className="flex items-center gap-2">
                                            <span>{typeIcons[item.type] || "📄"}</span>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium truncate">
                                                    {item.brief?.title || item.code}
                                                </p>
                                                <p className="text-xs text-muted-foreground font-mono truncate">
                                                    {item.code}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Gantt Bar */}
                                    <div className="flex-1 relative h-14">
                                        {/* Grid lines */}
                                        <div className="absolute inset-0 flex">
                                            {days.map((day, i) => (
                                                <div
                                                    key={i}
                                                    className={cn(
                                                        "flex-1 border-r",
                                                        format(day, "EEE", { locale: ptBR }) === "sáb" ||
                                                            format(day, "EEE", { locale: ptBR }) === "dom"
                                                            ? "bg-muted/30"
                                                            : ""
                                                    )}
                                                />
                                            ))}
                                        </div>

                                        {/* Bar */}
                                        {barPos && (
                                            <div
                                                className="absolute top-2 h-10 flex items-center"
                                                style={{ left: barPos.left, width: barPos.width, minWidth: '80px' }}
                                            >
                                                <div
                                                    className={cn(
                                                        "h-8 w-full rounded-md flex items-center px-2 text-white text-xs font-medium shadow-sm",
                                                        statusColors[item.status] || "bg-gray-400"
                                                    )}
                                                >
                                                    <span className="truncate">
                                                        {statusLabels[item.status]}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t">
                <span className="text-sm text-muted-foreground">Status:</span>
                {Object.entries(statusLabels).slice(0, 6).map(([status, label]) => (
                    <div key={status} className="flex items-center gap-1.5">
                        <div className={cn("w-3 h-3 rounded", statusColors[status])} />
                        <span className="text-xs">{label}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
