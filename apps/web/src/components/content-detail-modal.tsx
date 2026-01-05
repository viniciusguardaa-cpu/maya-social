"use client"

import { useState } from "react"
import { api } from "@/lib/api"
import { useAuthStore } from "@/lib/store"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
    Calendar,
    Clock,
    Sparkles,
    Save,
    ArrowRight,
    Loader2,
    FileText,
    Image as ImageIcon,
    Video,
    Hash,
    Target,
    MessageSquare,
    Send,
    User
} from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { InstagramPreview } from "@/components/instagram-preview"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
        references?: string[]
    }
}

interface Comment {
    id: string
    text: string
    author: string
    createdAt: string
}

interface ContentDetailModalProps {
    content: ContentItem | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onUpdate?: () => void
}

const statusConfig: Record<string, { label: string; color: string }> = {
    PLANNED: { label: "Planejado", color: "bg-slate-500" },
    BRIEFED: { label: "Briefado", color: "bg-blue-500" },
    IN_PRODUCTION: { label: "Em Produção", color: "bg-purple-500" },
    READY: { label: "Pronto", color: "bg-cyan-500" },
    AWAITING_APPROVAL: { label: "Aguardando Aprovação", color: "bg-yellow-500" },
    APPROVED: { label: "Aprovado", color: "bg-green-500" },
    SCHEDULED: { label: "Agendado", color: "bg-indigo-500" },
    PUBLISHED: { label: "Publicado", color: "bg-emerald-500" },
}

const typeIcons: Record<string, string> = {
    FEED: "📷",
    REELS: "🎬",
    STORIES: "📱",
    CAROUSEL: "🎠",
    AD: "📢",
}

const statusOrder = ["PLANNED", "BRIEFED", "IN_PRODUCTION", "READY", "AWAITING_APPROVAL", "APPROVED", "SCHEDULED"]

export function ContentDetailModal({ content, open, onOpenChange, onUpdate }: ContentDetailModalProps) {
    const { currentOrg, currentBrand, user } = useAuthStore()
    const [loading, setLoading] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [briefData, setBriefData] = useState({
        title: "",
        description: "",
        objective: "",
        cta: "",
        hashtags: ""
    })
    const [newComment, setNewComment] = useState("")
    const [comments, setComments] = useState<Comment[]>([])

    if (!content) return null

    const statusInfo = statusConfig[content.status] || { label: content.status, color: "bg-gray-500" }
    const currentIndex = statusOrder.indexOf(content.status)
    const nextStatus = currentIndex < statusOrder.length - 1 ? statusOrder[currentIndex + 1] : null

    const handleGenerateBrief = async () => {
        if (!currentOrg || !currentBrand) return
        setLoading(true)
        try {
            await api.post(
                `/organizations/${currentOrg.id}/brands/${currentBrand.id}/content/${content.id}/generate-brief`
            )
            toast.success("Brief gerado com IA! ✨")
            onUpdate?.()
        } catch (error: any) {
            console.error("Failed to generate brief:", error)
            toast.error(error.response?.data?.message || "Erro ao gerar brief")
        } finally {
            setLoading(false)
        }
    }

    const handleMoveStatus = async () => {
        if (!currentOrg || !currentBrand || !nextStatus) return
        setLoading(true)
        try {
            await api.post(
                `/organizations/${currentOrg.id}/brands/${currentBrand.id}/content/${content.id}/move-to`,
                { status: nextStatus }
            )
            toast.success(`Movido para ${statusConfig[nextStatus]?.label}`)
            onUpdate?.()
            onOpenChange(false)
        } catch (error: any) {
            console.error("Failed to move status:", error)
            toast.error(error.response?.data?.message || "Erro ao mover status")
        } finally {
            setLoading(false)
        }
    }

    const handleSaveBrief = async () => {
        if (!currentOrg || !currentBrand) return
        setLoading(true)
        try {
            const data = {
                title: briefData.title,
                description: briefData.description,
                objective: briefData.objective,
                cta: briefData.cta,
                hashtags: briefData.hashtags.split(",").map(h => h.trim()).filter(Boolean)
            }

            if (content.brief?.id) {
                await api.patch(
                    `/organizations/${currentOrg.id}/brands/${currentBrand.id}/content/brief/${content.brief.id}`,
                    data
                )
            } else {
                await api.post(
                    `/organizations/${currentOrg.id}/brands/${currentBrand.id}/content/${content.id}/brief`,
                    data
                )
            }
            toast.success("Brief salvo com sucesso!")
            setEditMode(false)
            onUpdate?.()
        } catch (error: any) {
            console.error("Failed to save brief:", error)
            toast.error(error.response?.data?.message || "Erro ao salvar brief")
        } finally {
            setLoading(false)
        }
    }

    const startEdit = () => {
        setBriefData({
            title: content.brief?.title || "",
            description: content.brief?.description || "",
            objective: content.brief?.objective || "",
            cta: content.brief?.cta || "",
            hashtags: content.brief?.hashtags?.join(", ") || ""
        })
        setEditMode(true)
    }

    const handleAddComment = () => {
        if (!newComment.trim()) return

        const comment: Comment = {
            id: Date.now().toString(),
            text: newComment,
            author: user?.name || "Você",
            createdAt: "Agora"
        }
        setComments([...comments, comment])
        setNewComment("")
        toast.success("Comentário adicionado!")
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{typeIcons[content.type] || "📄"}</span>
                        <div className="flex-1">
                            <DialogTitle className="text-lg">
                                {content.brief?.title || content.code}
                            </DialogTitle>
                            <p className="text-sm text-muted-foreground font-mono">{content.code}</p>
                        </div>
                        <Badge className={`${statusInfo.color} text-white`}>
                            {statusInfo.label}
                        </Badge>
                    </div>
                </DialogHeader>

                <Separator />

                {/* Meta Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Tipo:</span>
                        <span className="font-medium">{content.type}</span>
                    </div>
                    {content.scheduledAt && (
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Agendado:</span>
                            <span className="font-medium">
                                {new Date(content.scheduledAt).toLocaleDateString("pt-BR", {
                                    day: "2-digit",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                })}
                            </span>
                        </div>
                    )}
                </div>

                <Separator />

                {/* Brief Section */}
                {editMode ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Título</Label>
                            <Input
                                value={briefData.title}
                                onChange={(e) => setBriefData({ ...briefData, title: e.target.value })}
                                placeholder="Título do conteúdo"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Descrição</Label>
                            <Textarea
                                value={briefData.description}
                                onChange={(e) => setBriefData({ ...briefData, description: e.target.value })}
                                placeholder="Descreva o conteúdo..."
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Objetivo</Label>
                            <Input
                                value={briefData.objective}
                                onChange={(e) => setBriefData({ ...briefData, objective: e.target.value })}
                                placeholder="Ex: Aumentar engajamento"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>CTA (Call to Action)</Label>
                            <Input
                                value={briefData.cta}
                                onChange={(e) => setBriefData({ ...briefData, cta: e.target.value })}
                                placeholder="Ex: Comente sua opinião!"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Hashtags (separadas por vírgula)</Label>
                            <Input
                                value={briefData.hashtags}
                                onChange={(e) => setBriefData({ ...briefData, hashtags: e.target.value })}
                                placeholder="#maya, #socialmedia"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleSaveBrief} disabled={loading}>
                                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                Salvar
                            </Button>
                            <Button variant="outline" onClick={() => setEditMode(false)}>
                                Cancelar
                            </Button>
                        </div>
                    </div>
                ) : content.brief ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold">Brief</h3>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={handleGenerateBrief} disabled={loading}>
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Sparkles className="h-4 w-4 mr-1" />}
                                    Gerar Brief IA
                                </Button>
                                <Button variant="outline" size="sm" onClick={startEdit}>
                                    Editar
                                </Button>
                            </div>
                        </div>

                        {content.brief.description && (
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MessageSquare className="h-4 w-4" /> Descrição
                                </div>
                                <p className="text-sm bg-muted/50 p-3 rounded-lg">{content.brief.description}</p>
                            </div>
                        )}

                        {content.brief.objective && (
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Target className="h-4 w-4" /> Objetivo
                                </div>
                                <p className="text-sm">{content.brief.objective}</p>
                            </div>
                        )}

                        {content.brief.cta && (
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <ArrowRight className="h-4 w-4" /> CTA
                                </div>
                                <p className="text-sm font-medium">{content.brief.cta}</p>
                            </div>
                        )}

                        {content.brief.hashtags && content.brief.hashtags.length > 0 && (
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Hash className="h-4 w-4" /> Hashtags
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {content.brief.hashtags.map((tag, i) => (
                                        <Badge key={i} variant="secondary" className="text-xs">
                                            {tag.startsWith("#") ? tag : `#${tag}`}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-6">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                        <p className="text-muted-foreground mb-4">Nenhum brief criado</p>
                        <div className="flex gap-2 justify-center">
                            <Button variant="outline" onClick={startEdit}>
                                Criar Manualmente
                            </Button>
                            <Button onClick={handleGenerateBrief} disabled={loading}>
                                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                                Gerar com IA
                            </Button>
                        </div>
                    </div>
                )}

                <Separator />

                {/* Comments Section */}
                <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Comentários ({comments.length})
                    </h3>

                    <div className="space-y-3 max-h-48 overflow-y-auto">
                        {comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-xs bg-primary/10">
                                        {comment.author.split(" ").map(n => n[0]).join("")}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">{comment.author}</span>
                                        <span className="text-xs text-muted-foreground">{comment.createdAt}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{comment.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <Input
                            placeholder="Adicione um comentário..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                        />
                        <Button size="icon" onClick={handleAddComment} disabled={!newComment.trim()}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <Separator />

                {/* Actions */}
                <div className="flex justify-between">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Fechar
                    </Button>
                    {nextStatus && (
                        <Button onClick={handleMoveStatus} disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ArrowRight className="h-4 w-4 mr-2" />}
                            Avançar para {statusConfig[nextStatus]?.label}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
