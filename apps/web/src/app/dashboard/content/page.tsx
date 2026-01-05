"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/lib/store"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { ContentDetailModal } from "@/components/content-detail-modal"
import {
    DndContext,
    DragOverlay,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
} from "@dnd-kit/core"
import { useDraggable, useDroppable } from "@dnd-kit/core"
import {
    Search,
    Plus,
    Clock,
    Sparkles,
    ArrowRight,
    Loader2,
    RefreshCw,
    GripVertical
} from "lucide-react"
import { toast } from "sonner"

interface ContentItem {
    id: string
    code: string
    type: string
    status: string
    scheduledAt?: string
    brief?: {
        id?: string
        title?: string
        description?: string
        objective?: string
        cta?: string
        hashtags?: string[]
    }
}

interface KanbanData {
    columns: Record<string, ContentItem[]>
    counts: Record<string, number>
    total: number
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    PLANNED: { label: "Planejado", color: "text-slate-600", bg: "bg-slate-100" },
    BRIEFED: { label: "Briefado", color: "text-blue-600", bg: "bg-blue-100" },
    IN_PRODUCTION: { label: "Em Produção", color: "text-purple-600", bg: "bg-purple-100" },
    READY: { label: "Pronto", color: "text-cyan-600", bg: "bg-cyan-100" },
    AWAITING_APPROVAL: { label: "Aguardando", color: "text-yellow-600", bg: "bg-yellow-100" },
    APPROVED: { label: "Aprovado", color: "text-green-600", bg: "bg-green-100" },
    SCHEDULED: { label: "Agendado", color: "text-indigo-600", bg: "bg-indigo-100" },
    PUBLISHED: { label: "Publicado", color: "text-emerald-600", bg: "bg-emerald-100" },
}

const typeIcons: Record<string, string> = {
    FEED: "📷",
    REELS: "🎬",
    STORIES: "📱",
    CAROUSEL: "🎠",
    AD: "📢",
}

const statusOrder = ["PLANNED", "BRIEFED", "IN_PRODUCTION", "READY", "AWAITING_APPROVAL", "APPROVED", "SCHEDULED"]

interface KanbanCardProps {
    item: ContentItem
    onMove?: (id: string, status: string) => void
    onGenerateBrief?: (id: string) => void
    onClick?: (item: ContentItem) => void
    isMoving?: boolean
}

function DraggableCard({ item, onMove, onGenerateBrief, onClick, isMoving }: KanbanCardProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: item.id,
        data: { item },
    })

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined

    const currentIndex = statusOrder.indexOf(item.status)
    const nextStatus = currentIndex < statusOrder.length - 1 ? statusOrder[currentIndex + 1] : null

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group bg-card border rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-pointer ${isMoving || isDragging ? 'opacity-50 shadow-lg' : ''}`}
            onClick={() => !isDragging && onClick?.(item)}
        >
            <div
                {...listeners}
                {...attributes}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
                onClick={(e) => e.stopPropagation()}
            >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-lg">{typeIcons[item.type] || "📄"}</span>
                    <Badge variant="outline" className="text-xs">{item.type}</Badge>
                </div>
                {isMoving && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>

            <h4 className="font-medium text-sm mb-1 line-clamp-2">
                {item.brief?.title || item.code}
            </h4>

            <p className="text-xs text-muted-foreground font-mono truncate mb-2">
                {item.code}
            </p>

            {item.scheduledAt && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <Clock className="h-3 w-3" />
                    {new Date(item.scheduledAt).toLocaleDateString("pt-BR", {
                        day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
                    })}
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.status === "PLANNED" && onGenerateBrief && (
                    <Button size="sm" variant="outline" className="h-7 text-xs flex-1" onClick={(e) => { e.stopPropagation(); onGenerateBrief(item.id) }} disabled={isMoving}>
                        <Sparkles className="h-3 w-3 mr-1" /> Brief IA
                    </Button>
                )}
                {nextStatus && onMove && (
                    <Button size="sm" variant="default" className="h-7 text-xs flex-1" onClick={(e) => { e.stopPropagation(); onMove(item.id, nextStatus) }} disabled={isMoving}>
                        <ArrowRight className="h-3 w-3 mr-1" /> Avançar
                    </Button>
                )}
            </div>
        </div>
    )
}

interface KanbanColumnProps {
    status: string
    items: ContentItem[]
    onMove: (id: string, status: string) => void
    onGenerateBrief: (id: string) => void
    onItemClick: (item: ContentItem) => void
    movingId: string | null
}

function DroppableColumn({ status, items, onMove, onGenerateBrief, onItemClick, movingId }: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({ id: status })
    const config = statusConfig[status] || { label: status, color: "text-gray-600", bg: "bg-gray-100" }

    return (
        <div className={`flex flex-col min-w-[280px] max-w-[280px] bg-muted/30 rounded-lg transition-all ${isOver ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
            <div className={`flex items-center justify-between p-3 border-b ${config.bg} rounded-t-lg`}>
                <div className="flex items-center gap-2">
                    <span className={`font-medium text-sm ${config.color}`}>{config.label}</span>
                    <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {items.length}
                    </Badge>
                </div>
            </div>

            <div ref={setNodeRef} className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[100px]">
                {items.map((item) => (
                    <DraggableCard
                        key={item.id}
                        item={item}
                        onMove={onMove}
                        onGenerateBrief={onGenerateBrief}
                        onClick={onItemClick}
                        isMoving={movingId === item.id}
                    />
                ))}
                {items.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <p className="text-xs">{isOver ? 'Solte aqui' : 'Nenhum item'}</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function ContentPage() {
    const { currentOrg, currentBrand } = useAuthStore()
    const [searchQuery, setSearchQuery] = useState("")
    const [kanban, setKanban] = useState<KanbanData | null>(null)
    const [loading, setLoading] = useState(true)
    const [movingId, setMovingId] = useState<string | null>(null)
    const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null)
    const [modalOpen, setModalOpen] = useState(false)

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    )

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        if (!over || !active.data.current) return

        const item = active.data.current.item as ContentItem
        const newStatus = over.id as string

        if (item.status !== newStatus && statusOrder.includes(newStatus)) {
            await moveToStatus(item.id, newStatus)
        }
    }

    const fetchKanban = async () => {
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

    useEffect(() => {
        fetchKanban()
    }, [currentOrg, currentBrand])

    const moveToStatus = async (contentId: string, newStatus: string) => {
        if (!currentOrg || !currentBrand) return

        setMovingId(contentId)

        try {
            await api.post(
                `/organizations/${currentOrg.id}/brands/${currentBrand.id}/content/${contentId}/move-to`,
                { status: newStatus }
            )
            await fetchKanban()
            toast.success(`Movido para ${statusConfig[newStatus]?.label || newStatus}`)
        } catch (error) {
            console.error("Failed to move content:", error)
            toast.error("Erro ao mover conteúdo")
        } finally {
            setMovingId(null)
        }
    }

    const generateBrief = async (contentId: string) => {
        if (!currentOrg || !currentBrand) return

        setMovingId(contentId)
        toast.loading("Gerando brief com IA...")

        try {
            await api.post(
                `/organizations/${currentOrg.id}/brands/${currentBrand.id}/content/${contentId}/generate-brief`
            )
            await fetchKanban()
            toast.success("Brief gerado com sucesso!")
        } catch (error) {
            console.error("Failed to generate brief:", error)
            toast.error("Erro ao gerar brief")
        } finally {
            setMovingId(null)
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-9 w-32" />
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {statusOrder.map((status) => (
                        <div key={status} className="min-w-[280px] space-y-2">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Conteúdos</h1>
                    <p className="text-muted-foreground">
                        {kanban?.total || 0} itens no total
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={fetchKanban}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Atualizar
                    </Button>
                    <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Conteúdo
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por código ou título..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Tipo:</span>
                    {["FEED", "REELS", "STORIES", "CAROUSEL"].map((type) => (
                        <Badge
                            key={type}
                            variant="outline"
                            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                            {typeIcons[type] || "📄"} {type}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Kanban Board */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {statusOrder.map((status) => (
                        <DroppableColumn
                            key={status}
                            status={status}
                            items={kanban?.columns[status] || []}
                            onMove={moveToStatus}
                            onGenerateBrief={generateBrief}
                            onItemClick={(item: ContentItem) => { setSelectedContent(item); setModalOpen(true) }}
                            movingId={movingId}
                        />
                    ))}
                </div>
            </DndContext>

            {/* Content Detail Modal */}
            <ContentDetailModal
                content={selectedContent}
                open={modalOpen}
                onOpenChange={setModalOpen}
                onUpdate={fetchKanban}
            />
        </div>
    )
}
