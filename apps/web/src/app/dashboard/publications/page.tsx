"use client"

import { useState } from "react"
import { useAuthStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Send,
    Clock,
    CheckCircle,
    XCircle,
    Instagram,
    Calendar,
    Image as ImageIcon,
    Video,
    Eye,
    MoreVertical,
    RefreshCw,
    Play,
    Loader2,
    AlertCircle
} from "lucide-react"

interface Publication {
    id: string
    contentCode: string
    title: string
    caption: string
    type: "FEED" | "REELS" | "STORIES" | "CAROUSEL"
    status: "scheduled" | "published" | "failed" | "draft"
    scheduledAt?: string
    publishedAt?: string
    thumbnail: string
    metrics?: {
        likes: number
        comments: number
        reach: number
    }
}

const mockPublications: Publication[] = []

const statusConfig = {
    scheduled: { label: "Agendado", color: "bg-blue-500", icon: Clock },
    published: { label: "Publicado", color: "bg-green-500", icon: CheckCircle },
    failed: { label: "Falhou", color: "bg-red-500", icon: XCircle },
    draft: { label: "Rascunho", color: "bg-gray-500", icon: AlertCircle },
}

const typeIcons = {
    FEED: "📷",
    REELS: "🎬",
    STORIES: "📱",
    CAROUSEL: "🎠",
}

export default function PublicationsPage() {
    const { currentBrand } = useAuthStore()
    const [publications, setPublications] = useState<Publication[]>(mockPublications)
    const [filter, setFilter] = useState<"all" | "scheduled" | "published" | "failed">("all")
    const [selectedPub, setSelectedPub] = useState<Publication | null>(null)
    const [previewOpen, setPreviewOpen] = useState(false)
    const [publishing, setPublishing] = useState<string | null>(null)

    const filtered = publications.filter(p => filter === "all" || p.status === filter)
    const scheduled = publications.filter(p => p.status === "scheduled")
    const published = publications.filter(p => p.status === "published")
    const failed = publications.filter(p => p.status === "failed")

    const handlePublishNow = async (id: string) => {
        setPublishing(id)
        await new Promise(r => setTimeout(r, 2000))
        setPublications(prev => prev.map(p =>
            p.id === id ? { ...p, status: "published" as const, publishedAt: new Date().toISOString() } : p
        ))
        setPublishing(null)
    }

    const handleRetry = async (id: string) => {
        setPublishing(id)
        await new Promise(r => setTimeout(r, 2000))
        setPublications(prev => prev.map(p =>
            p.id === id ? { ...p, status: "scheduled" as const } : p
        ))
        setPublishing(null)
    }

    const openPreview = (pub: Publication) => {
        setSelectedPub(pub)
        setPreviewOpen(true)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Publicações</h1>
                    <p className="text-muted-foreground">
                        {scheduled.length} agendadas • {published.length} publicadas • {failed.length} com falha
                    </p>
                </div>
                <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sincronizar
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid sm:grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setFilter("scheduled")}>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Clock className="h-6 w-6 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{scheduled.length}</p>
                            <p className="text-sm text-muted-foreground">Agendadas</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setFilter("published")}>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-green-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{published.length}</p>
                            <p className="text-sm text-muted-foreground">Publicadas</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setFilter("failed")}>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
                            <XCircle className="h-6 w-6 text-red-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{failed.length}</p>
                            <p className="text-sm text-muted-foreground">Falhas</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 border-b pb-2">
                {(["all", "scheduled", "published", "failed"] as const).map((f) => (
                    <Button
                        key={f}
                        variant={filter === f ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setFilter(f)}
                    >
                        {f === "all" ? "Todas" : statusConfig[f].label}
                    </Button>
                ))}
            </div>

            {/* Publications List */}
            <div className="space-y-4">
                {filtered.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <Send className="h-16 w-16 text-muted-foreground/50 mb-4" />
                            <p className="text-lg font-medium text-muted-foreground">Nenhuma publicação</p>
                        </CardContent>
                    </Card>
                ) : (
                    filtered.map((pub) => {
                        const status = statusConfig[pub.status]
                        const StatusIcon = status.icon
                        const isPublishing = publishing === pub.id

                        return (
                            <Card key={pub.id} className="overflow-hidden">
                                <div className="flex flex-col sm:flex-row">
                                    {/* Thumbnail */}
                                    <div
                                        className="w-full sm:w-32 h-32 sm:h-auto relative cursor-pointer"
                                        onClick={() => openPreview(pub)}
                                    >
                                        <img
                                            src={pub.thumbnail}
                                            alt={pub.title}
                                            className="w-full h-full object-cover"
                                        />
                                        {pub.type === "REELS" && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                <Play className="h-8 w-8 text-white fill-white" />
                                            </div>
                                        )}
                                        <div className="absolute top-2 left-2">
                                            <span className="text-xl">{typeIcons[pub.type]}</span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-medium">{pub.title}</h3>
                                                    <Badge className={`${status.color} text-white text-xs`}>
                                                        <StatusIcon className="h-3 w-3 mr-1" />
                                                        {status.label}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground font-mono mb-2">
                                                    {pub.contentCode}
                                                </p>
                                                <p className="text-sm line-clamp-2 whitespace-pre-wrap">
                                                    {pub.caption}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                {pub.status === "scheduled" && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handlePublishNow(pub.id)}
                                                        disabled={isPublishing}
                                                    >
                                                        {isPublishing ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <Send className="h-4 w-4 mr-1" />
                                                                Publicar
                                                            </>
                                                        )}
                                                    </Button>
                                                )}
                                                {pub.status === "failed" && (
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleRetry(pub.id)}
                                                        disabled={isPublishing}
                                                    >
                                                        {isPublishing ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <RefreshCw className="h-4 w-4 mr-1" />
                                                                Tentar Novamente
                                                            </>
                                                        )}
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="icon" onClick={() => openPreview(pub)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Meta Info */}
                                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                                            {pub.scheduledAt && (
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    {new Date(pub.scheduledAt).toLocaleDateString("pt-BR", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        hour: "2-digit",
                                                        minute: "2-digit"
                                                    })}
                                                </div>
                                            )}
                                            {pub.publishedAt && (
                                                <div className="flex items-center gap-1">
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                    Publicado {new Date(pub.publishedAt).toLocaleDateString("pt-BR")}
                                                </div>
                                            )}
                                            {pub.metrics && (
                                                <div className="flex items-center gap-3 ml-auto">
                                                    <span>❤️ {pub.metrics.likes.toLocaleString()}</span>
                                                    <span>💬 {pub.metrics.comments}</span>
                                                    <span>👁️ {pub.metrics.reach.toLocaleString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )
                    })
                )}
            </div>

            {/* Preview Dialog */}
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Instagram className="h-5 w-5" />
                            Preview da Publicação
                        </DialogTitle>
                    </DialogHeader>

                    {selectedPub && (
                        <div className="space-y-4">
                            {/* Instagram Post Preview */}
                            <div className="border rounded-lg overflow-hidden">
                                <div className="flex items-center gap-3 p-3 border-b">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500" />
                                    <span className="font-medium text-sm">mayaagencia</span>
                                </div>
                                <div className="aspect-square relative">
                                    <img
                                        src={selectedPub.thumbnail}
                                        alt={selectedPub.title}
                                        className="w-full h-full object-cover"
                                    />
                                    {selectedPub.type === "REELS" && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                            <Play className="h-12 w-12 text-white fill-white" />
                                        </div>
                                    )}
                                </div>
                                <div className="p-3">
                                    <div className="flex gap-4 mb-3">
                                        <span>❤️</span>
                                        <span>💬</span>
                                        <span>📤</span>
                                    </div>
                                    <p className="text-sm whitespace-pre-wrap">
                                        <span className="font-medium">mayaagencia </span>
                                        {selectedPub.caption}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <Badge variant="outline">{selectedPub.type}</Badge>
                                <span className="text-muted-foreground font-mono">{selectedPub.contentCode}</span>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
