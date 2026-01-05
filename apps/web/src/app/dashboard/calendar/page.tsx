"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/lib/store"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { GanttChart } from "@/components/gantt-chart"
import { ContentDetailModal } from "@/components/content-detail-modal"
import { CalendarConfigModal } from "@/components/calendar-config-modal"
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Sparkles,
    Loader2,
    RefreshCw,
    AlertCircle,
    LayoutGrid,
    GanttChartSquare,
    Trash2
} from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"

interface ContentItem {
    id: string
    code: string
    type: string
    status: string
    scheduledAt?: string
    brief?: { title?: string }
}

interface CalendarMonth {
    id: string
    year: number
    month: number
    status: string
    contentItems: ContentItem[]
}

const typeColors: Record<string, string> = {
    FEED: "bg-pink-500",
    REELS: "bg-purple-500",
    STORIES: "bg-blue-500",
    CAROUSEL: "bg-orange-500",
    AD: "bg-green-500",
}

const typeLabels: Record<string, string> = {
    FEED: "Feed",
    REELS: "Reels",
    STORIES: "Stories",
    CAROUSEL: "Carrossel",
    AD: "Anúncio",
}

function CalendarDay({ date, currentMonth, contents, onContentClick }: {
    date: Date
    currentMonth: Date
    contents: ContentItem[]
    onContentClick: (content: ContentItem) => void
}) {
    const isCurrentMonth = isSameMonth(date, currentMonth)
    const isCurrentDay = isToday(date)

    return (
        <div className={`min-h-[120px] border-r border-b p-1 ${isCurrentMonth ? "bg-card" : "bg-muted/30"}`}>
            <div className={`text-right text-sm p-1 ${isCurrentDay
                ? "bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center ml-auto"
                : isCurrentMonth ? "text-foreground" : "text-muted-foreground"
                }`}>
                {format(date, "d")}
            </div>

            <div className="space-y-1 mt-1">
                {contents.slice(0, 3).map((content) => {
                    const time = content.scheduledAt ? format(new Date(content.scheduledAt), "HH:mm") : ""
                    return (
                        <div
                            key={content.id}
                            onClick={() => onContentClick(content)}
                            className={`text-xs px-1.5 py-0.5 rounded truncate text-white cursor-pointer hover:opacity-80 hover:scale-105 transition-all ${typeColors[content.type] || "bg-gray-500"}`}
                            title={content.brief?.title || content.code}
                        >
                            <span className="font-medium">{time}</span> {content.brief?.title || content.type}
                        </div>
                    )
                })}
                {contents.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center">
                        +{contents.length - 3} mais
                    </div>
                )}
            </div>
        </div>
    )
}

type ViewMode = "calendar" | "gantt"

export default function CalendarPage() {
    const { currentOrg, currentBrand } = useAuthStore()
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [calendarData, setCalendarData] = useState<CalendarMonth | null>(null)
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [viewMode, setViewMode] = useState<ViewMode>("calendar")
    const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [configModalOpen, setConfigModalOpen] = useState(false)

    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth() + 1

    const fetchCalendar = async () => {
        if (!currentOrg || !currentBrand) return

        setLoading(true)
        try {
            const response = await api.get(
                `/organizations/${currentOrg.id}/brands/${currentBrand.id}/calendar/month`,
                { params: { year, month } }
            )
            setCalendarData(response.data)
        } catch (error: any) {
            if (error.response?.status === 404) {
                setCalendarData(null)
            } else {
                console.error("Failed to fetch calendar:", error)
            }
        } finally {
            setLoading(false)
        }
    }

    const generateMonth = async (config?: any[]) => {
        if (!currentOrg || !currentBrand) return

        setGenerating(true)
        setConfigModalOpen(false)
        try {
            await api.post(
                `/organizations/${currentOrg.id}/brands/${currentBrand.id}/calendar/generate`,
                { year, month, config }
            )
            await fetchCalendar()
            toast.success(`Plano de ${format(currentMonth, "MMMM yyyy", { locale: ptBR })} gerado com sucesso!`)
        } catch (error: any) {
            console.error("Failed to generate month:", error)
            toast.error('Erro ao gerar mês. Verifique o console.')
        } finally {
            setGenerating(false)
        }
    }

    const deleteMonth = async () => {
        if (!currentOrg || !currentBrand || !calendarData) return

        if (!confirm(`Tem certeza que deseja deletar o planejamento de ${format(currentMonth, "MMMM yyyy", { locale: ptBR })}? Isso vai remover todos os ${calendarData.contentItems?.length || 0} conteúdos.`)) {
            return
        }

        setLoading(true)
        try {
            await api.delete(
                `/organizations/${currentOrg.id}/brands/${currentBrand.id}/calendar/${calendarData.id}`
            )
            setCalendarData(null)
            toast.success('Mês deletado! Agora você pode gerar novamente.')
        } catch (error: any) {
            console.error("Failed to delete month:", error)
            toast.error('Erro ao deletar mês.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCalendar()
    }, [currentOrg, currentBrand, year, month])

    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const startDate = new Date(monthStart)
    startDate.setDate(startDate.getDate() - startDate.getDay())
    const endDate = new Date(monthEnd)
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))

    const days = eachDayOfInterval({ start: startDate, end: endDate })
    const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

    const schedule: Record<string, ContentItem[]> = {}
    if (calendarData?.contentItems) {
        calendarData.contentItems.forEach(item => {
            if (item.scheduledAt) {
                const dateKey = format(new Date(item.scheduledAt), "yyyy-MM-dd")
                if (!schedule[dateKey]) schedule[dateKey] = []
                schedule[dateKey].push(item)
            }
        })
    }

    const totalPosts = calendarData?.contentItems?.length || 0

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Calendário Editorial</h1>
                    <p className="text-muted-foreground">
                        {loading ? "Carregando..." : `${totalPosts} publicações planejadas`}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* View Toggle */}
                    <div className="flex items-center border rounded-lg p-1">
                        <Button
                            variant={viewMode === "calendar" ? "secondary" : "ghost"}
                            size="sm"
                            className="h-8 px-3"
                            onClick={() => setViewMode("calendar")}
                        >
                            <LayoutGrid className="h-4 w-4 mr-1" />
                            Calendário
                        </Button>
                        <Button
                            variant={viewMode === "gantt" ? "secondary" : "ghost"}
                            size="sm"
                            className="h-8 px-3"
                            onClick={() => setViewMode("gantt")}
                        >
                            <GanttChartSquare className="h-4 w-4 mr-1" />
                            Timeline
                        </Button>
                    </div>

                    <Button variant="outline" size="sm" onClick={fetchCalendar} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                        Atualizar
                    </Button>
                    {calendarData && !loading && (
                        <Button variant="outline" size="sm" onClick={deleteMonth} className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Resetar Mês
                        </Button>
                    )}
                    {!calendarData && !loading && (
                        <Button size="sm" onClick={() => setConfigModalOpen(true)} disabled={generating}>
                            {generating ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Sparkles className="h-4 w-4 mr-2" />
                            )}
                            Gerar Mês
                        </Button>
                    )}
                </div>
            </div>

            {/* Month Navigation */}
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <CardTitle className="text-xl capitalize">
                            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
                        </CardTitle>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className={viewMode === "gantt" ? "p-4" : "p-0"}>
                    {loading ? (
                        <div className="grid grid-cols-7">
                            {Array.from({ length: 35 }).map((_, i) => (
                                <div key={i} className="min-h-[120px] border-r border-b p-2">
                                    <Skeleton className="h-6 w-6 ml-auto mb-2" />
                                    <Skeleton className="h-4 w-full mb-1" />
                                </div>
                            ))}
                        </div>
                    ) : !calendarData ? (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                            <AlertCircle className="h-12 w-12 mb-4 opacity-50" />
                            <p className="text-lg font-medium">Mês não gerado</p>
                            <p className="text-sm">Clique em "Gerar Mês" para criar o planejamento</p>
                        </div>
                    ) : viewMode === "gantt" ? (
                        <GanttChart
                            items={calendarData.contentItems || []}
                            currentMonth={currentMonth}
                            onItemClick={(item) => { setSelectedContent(item); setModalOpen(true) }}
                        />
                    ) : (
                        <>
                            {/* Week days header */}
                            <div className="grid grid-cols-7 border-b">
                                {weekDays.map((day) => (
                                    <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2 border-r last:border-r-0">
                                        {day}
                                    </div>
                                ))}
                            </div>
                            {/* Calendar grid */}
                            <div className="grid grid-cols-7">
                                {days.map((day) => {
                                    const dateKey = format(day, "yyyy-MM-dd")
                                    const contents = schedule[dateKey] || []
                                    return (
                                        <CalendarDay
                                            key={dateKey}
                                            date={day}
                                            currentMonth={currentMonth}
                                            contents={contents}
                                            onContentClick={(item) => {
                                                setSelectedContent(item)
                                                setModalOpen(true)
                                            }}
                                        />
                                    )
                                })}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Legend */}
            {viewMode === "calendar" && (
                <div className="flex flex-wrap items-center gap-4">
                    <span className="text-sm text-muted-foreground">Legenda:</span>
                    {Object.entries(typeLabels).map(([type, label]) => (
                        <div key={type} className="flex items-center gap-1.5">
                            <div className={`w-3 h-3 rounded ${typeColors[type]}`} />
                            <span className="text-sm">{label}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Content Detail Modal */}
            <ContentDetailModal
                content={selectedContent}
                open={modalOpen}
                onOpenChange={setModalOpen}
                onUpdate={fetchCalendar}
            />

            {/* Calendar Config Modal */}
            <CalendarConfigModal
                open={configModalOpen}
                onOpenChange={setConfigModalOpen}
                onGenerate={generateMonth}
                generating={generating}
            />
        </div>
    )
}
